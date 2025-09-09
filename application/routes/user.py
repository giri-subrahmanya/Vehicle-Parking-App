from flask import current_app as app, request, jsonify, send_file
from flask_security import auth_required, roles_required, current_user
from sqlalchemy import or_
from datetime import datetime, timezone, timedelta
from celery.result import AsyncResult
import re
from application.database import db
from application.models import *
from application.cache import cache
from application.tasks import csv_report
from application.utils import get_time_str

@app.route('/api/user/parking_details')
@auth_required('token')
@roles_required('user')
def user():
    parking_history = []
    current_parking_details = []
    temp = ReserveParkingSpot.query.filter(ReserveParkingSpot.user_id == current_user.id).all()
    for i in temp:
        if not i.leaving_timestamp:
            current_parking_details.append({
                'booking_id' : i.id,
                'spot_id' : i.spot_id,
                'vehicle_no': i.vehicle_no,
                'price_per_minute' : i.price_per_minute,
                'booking_timestamp' : get_time_str(i.booking_timestamp),
                'parking_timestamp' : get_time_str(i.parking_timestamp),
                'leaving_timestamp' : get_time_str(i.leaving_timestamp),
                'parking_cost' : i.parking_cost,
                'status' : i.parking_spot.status,
                'prime_location_name' : i.parking_spot.parking_lot.prime_location_name,
                'pincode' : i.parking_spot.parking_lot.pincode,
                'address' : i.parking_spot.parking_lot.address,
            })
        else:
            parking_history.append({
                'booking_id' : i.id,
                'vehicle_no': i.vehicle_no,
                'price_per_minute' : i.price_per_minute,
                'booking_timestamp' : get_time_str(i.booking_timestamp),
                'parking_timestamp' : get_time_str(i.parking_timestamp),
                'leaving_timestamp' : get_time_str(i.leaving_timestamp),
                'parking_cost' : i.parking_cost,
                'prime_location_name' : i.parking_spot.parking_lot.prime_location_name,
                'pincode' : i.parking_spot.parking_lot.pincode,
                'address' : i.parking_spot.parking_lot.address
            })
    return jsonify({
        'current_parking_details' : current_parking_details,
        'parking_history' : parking_history
    }), 200

@app.route('/api/user/read_lot/<int:lot_id>')
@auth_required('token')
@roles_required('user')
def user_read_lot(lot_id):
    lot = ParkingLot.query.filter(ParkingLot.id == lot_id, ParkingLot.useable == True).first()

    if not lot:
        return jsonify({
            'message' : 'Given "lot_id" does not exist in the database'
        }), 400
    
    no_of_available_spots = ParkingSpot.query.filter(
            ParkingSpot.lot_id == lot_id,
            ParkingSpot.status == 'available',
            ParkingSpot.useable == True
        ).count()
    no_of_reserved_spots = ParkingSpot.query.filter(
        ParkingSpot.lot_id == lot_id,
        or_(ParkingSpot.status == 'booked', ParkingSpot.status == 'occupied'),
        ParkingSpot.useable == True
    ).count() 

    return jsonify({
        'lot_id' : lot.id,
        'prime_location_name' : lot.prime_location_name,
        'price_per_minute' : lot.price_per_minute,
        'number_of_spots' : lot.number_of_spots,
        'pincode' : lot.pincode,
        'address' : lot.address,
        'no_of_reserved_spots' : no_of_reserved_spots,
        'no_of_available_spots' : no_of_available_spots,
    })

@app.route('/api/user/book_spot', methods = ['POST'])
@auth_required('token')
@roles_required('user')
def book_spot():
    data = request.get_json()

    if 'lot_id' not in data.keys():
        return jsonify({
            'message' : '"lot_id" key not found in json.'
        }), 400
    
    if not isinstance(data['lot_id'], int):
        return jsonify({
            'message' : '"lot_id" must be an integer'
        }), 400
    
    if 'vehicle_no' not in data.keys():
        return jsonify({
            'message' : '"vehicle_no" key not found in json.'
        }), 400
    
    if not isinstance(data['vehicle_no'], str):
        return jsonify({
            'message' : '"vehicle_no" must be a string'
        }), 400
    
    if not re.fullmatch('^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$', data['vehicle_no']):
        return jsonify({
            'message' : '"vehicle_no" is invalid.'
        }), 400
    

    parking_lot = ParkingLot.query.filter(ParkingLot.id == data['lot_id'], ParkingLot.useable == True).first()

    if not parking_lot:
        return jsonify({
            'message' : 'Given "lot_id" does not exist in the database.'
        }), 400
    
    parking_spot = ParkingSpot.query.filter(
        ParkingSpot.lot_id == data['lot_id'],
        ParkingSpot.status == 'available',
        ParkingSpot.useable == True
    ).first()

    if not parking_spot:
        return jsonify({
            'message' : 'Parking spots are not currently available at this parking lot. Please try later.'
        }), 400
    
    parking_spot.status = 'booked'
    
    spot_reserve = ReserveParkingSpot(
        spot_id = parking_spot.id,
        vehicle_no = data['vehicle_no'],
        user_id = current_user.id,
        price_per_minute = parking_lot.price_per_minute,
        booking_timestamp = datetime.now(timezone(timedelta(hours=5,minutes=30))).isoformat()
    )
    
    db.session.add(spot_reserve)
    db.session.commit()

    cache.delete('parking_lots_details')

    return jsonify({
        'message' : 'Spot booked successfully.'
    }), 200  


@app.route('/api/user/park_in', methods = ['POST'])
@auth_required('token')
@roles_required('user')
def park_in():
    data = request.get_json()

    if 'booking_id' not in data.keys():
        return jsonify({
            'message' : '"booking_id" key not found in json.'
        }), 400
    
    if not isinstance(data['booking_id'], int):
        return jsonify({
            'message' : '"booking_id" must be an integer'
        }), 400

    booked_spot = ReserveParkingSpot.query.get(data['booking_id'])

    temp = False
    if not booked_spot:
        temp = True
    elif not booked_spot.parking_spot.useable:
        temp = True
    elif not booked_spot.parking_spot.parking_lot.useable:
        temp = True

    if temp:
        return jsonify({
            'message' : 'Given "booking_id" not found in the database.'
        }), 400

    if booked_spot.user_id != current_user.id:
        return jsonify({
            'message' : 'This spot is not booked by the user currently.'
        }), 400
    
    if booked_spot.leaving_timestamp:
        return jsonify({
            'message' : 'This "booking_id" has expired.'
        }), 400
    
    if booked_spot.parking_timestamp:
        return jsonify({
            'message' : 'The user has already parked his vehicle.'
        }), 400
    
    booked_spot.parking_timestamp = datetime.now(timezone(timedelta(hours=5,minutes=30))).isoformat()
    booked_spot.parking_spot.status = 'occupied'
    db.session.commit()

    return jsonify({
        'message' : 'Vehicle has been parked in successfully.'
    }), 200


@app.route('/api/user/vacate', methods = ['POST'])
@auth_required('token')
@roles_required('user')
def vacate():
    data = request.get_json()

    if 'booking_id' not in data.keys():
        return jsonify({
            'message' : '"booking_id" key not found in json.'
        }), 400
    
    if not isinstance(data['booking_id'], int):
        return jsonify({
            'message' : '"booking_id" must be an integer'
        }), 400
    
    booked_spot = ReserveParkingSpot.query.get(data['booking_id'])

    temp = False
    if not booked_spot:
        temp = True
    elif not booked_spot.parking_spot.useable:
        temp = True
    elif not booked_spot.parking_spot.parking_lot.useable:
        temp = True

    if temp:
        return jsonify({
            'message' : 'Given "booking_id" not found in the database.'
        }), 400

    if booked_spot.user_id != current_user.id:
        return jsonify({
            'message' : 'This spot is not booked by the user currently.'
        }), 400
    
    if not booked_spot.parking_timestamp:
        return jsonify({
            'message' : 'The user has not parked his vehicle yet.'
        }), 400

    if booked_spot.leaving_timestamp:
        return jsonify({
            'message' : 'This "booking_id" has expired.'
        }), 400
    
    booked_spot.leaving_timestamp = datetime.now(timezone(timedelta(hours=5,minutes=30))).isoformat()
    booked_spot.parking_cost = booked_spot.price_per_minute * (datetime.fromisoformat(booked_spot.leaving_timestamp) - datetime.fromisoformat(booked_spot.parking_timestamp)).total_seconds() / 60
    booked_spot.parking_spot.status = 'available'
    db.session.commit()

    cache.delete('parking_lots_details')

    return jsonify({
        'message' : 'The vehicle has vacated successfully.'
    }), 200


@app.route('/api/user/analytics')
@auth_required('token')
@roles_required('user')
def user_analytics():
    parking_history = ReserveParkingSpot.query.filter(
        ReserveParkingSpot.user_id == current_user.id,
        ReserveParkingSpot.leaving_timestamp.isnot(None)
    ).all()
    data = []
    for booked_spot in parking_history:
        data.append(
            (
                datetime.fromisoformat(booked_spot.leaving_timestamp) - 
                datetime.fromisoformat(booked_spot.parking_timestamp)
            ).total_seconds()
        )
    return jsonify(data), 200


@app.route('/api/user/csv_start')
@auth_required('token')
@roles_required('user')
def csv_start():
    result = csv_report.delay(current_user.id)
    return jsonify({'id' : result.id}), 200


@app.route('/api/user/csv_status/<id>')
@auth_required('token')
@roles_required('user')
def csv_status(id):
    result = AsyncResult(id)
    return jsonify({'state' : result.state}), 200


@app.route('/api/user/csv_download/<id>')
@auth_required('token')
@roles_required('user')
def csv_download(id):
    result = AsyncResult(id)
    if result.ready() and result.state == 'SUCCESS':
        return send_file(f'csv/{result.result}')
    else:
        return jsonify({'message' : 'CSV download not available.'}), 400

