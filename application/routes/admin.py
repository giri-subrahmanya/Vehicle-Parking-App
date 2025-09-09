from flask import current_app as app, request, jsonify
from flask_security import auth_required, roles_required, current_user
from sqlalchemy import or_
from application.database import db
from application.models import *
from application.utils import *
from application.cache import cache

@app.route('/api/admin/read_lot/<int:lot_id>')
@auth_required('token')
@roles_required('admin')
def admin_read_lot(lot_id):
    lot_object = ParkingLot.query.filter(ParkingLot.id == lot_id, ParkingLot.useable == True).first()

    if not lot_object:
        return jsonify({
            'message' : 'Given "lot_id" does not exist in the database'
        }), 400

    no_of_available_spots = 0
    no_of_reserved_spots = 0

    temp = ParkingSpot.query.filter(ParkingSpot.lot_id == lot_id, ParkingSpot.useable == True).all()
    parking_spots = []
    for i in temp:
        if i.status == 'available':
            no_of_available_spots += 1
        else:
            no_of_reserved_spots += 1
        parking_spots.append({
            'spot_id' : i.id,
            'status' : i.status
        })

    parking_history = []
    for booked_spot in ReserveParkingSpot.query.all():
        if booked_spot.parking_spot.parking_lot.id == lot_object.id:
            if booked_spot.leaving_timestamp:
                parking_history.append({
                    'user_id' : booked_spot.user_id,
                    'price_per_minute' : booked_spot.price_per_minute,
                    'vehicle_no' : booked_spot.vehicle_no,
                    'booking_timestamp' : get_time_str(booked_spot.booking_timestamp), 
                    'parking_timestamp' : get_time_str(booked_spot.parking_timestamp), 
                    'leaving_timestamp' : get_time_str(booked_spot.leaving_timestamp), 
                    'parking_cost' : booked_spot.parking_cost
                })

    return jsonify({
        'lot_id' : lot_object.id,
        'prime_location_name' : lot_object.prime_location_name,
        'price_per_minute' : lot_object.price_per_minute,
        'number_of_spots' : lot_object.number_of_spots,
        'pincode' : lot_object.pincode,
        'address' : lot_object.address,
        'no_of_reserved_spots' : no_of_reserved_spots,
        'no_of_available_spots' : no_of_available_spots,
        'parking_spots' : parking_spots,
        'parking_history' : parking_history
    }), 200


@app.route('/api/admin/create_lot', methods = ['POST'])
@auth_required('token')
@roles_required('admin')
def admin_create_lot():
    data = request.get_json()
    
    key_not_found_list = parking_lot_key_not_found(data)
    if key_not_found_list:
        return jsonify({
            'message' : ' '.join(key_not_found_list)
        }), 400
    
    fields_validation_list = parking_lot_fields_validation(data)
    if fields_validation_list:
        return jsonify({
            'message' : ' '.join(fields_validation_list) + ' ' + 'Please follow the format rules.'
        }), 400
    
    if ParkingLot.query.filter(
        ParkingLot.prime_location_name == data['prime_location_name'],
        ParkingLot.pincode == data['pincode'],
        ParkingLot.address == data['address'],
        ParkingLot.useable == True
    ).first():
        return jsonify({
            'message' : 'The combination of the given "prime_location_name", "pincode" and "address" already exists. Try another.'
        }), 400
    
    new_parking_lot = ParkingLot(
        prime_location_name = data['prime_location_name'],
        price_per_minute = data['price_per_minute'],
        number_of_spots = data['number_of_spots'],
        pincode = data['pincode'],
        address = data['address'],
        useable = True
    )

    db.session.add(new_parking_lot)
    db.session.commit()

    for i in range(new_parking_lot.number_of_spots):
        db.session.add(
            ParkingSpot(
                lot_id = new_parking_lot.id,
                status = 'available',
                useable = True
            )
        )
    db.session.commit()

    cache.delete('parking_lots_details')

    return jsonify({
        'message' : 'Parking_Lot created successfully.'
    }), 200


@app.route('/api/admin/edit_lot', methods = ['PUT'])
@auth_required('token')
@roles_required('admin')
def admin_edit_lot():
    data = request.get_json()
    
    if 'lot_id' not in data.keys():
        return jsonify({
            'message' : '"lot_id" key not found in json.'
        }), 400
    
    if not isinstance(data['lot_id'],int):
        return jsonify({
            'message' : '"lot_id" must be an integer.'
        }), 400

    parking_lot = ParkingLot.query.filter(ParkingLot.id == data['lot_id'], ParkingLot.useable == True).first()
    if not parking_lot:
        return jsonify({
            'message' : 'Given "lot_id" does not exist in the database'
        }), 400

    key_not_found_list = []
    for i in ['price_per_minute', 'number_of_spots']:
        if i not in data.keys():
            key_not_found_list.append(f'"{i}" key not found.')

    if key_not_found_list:
        return jsonify({
            'message' : ' '.join(key_not_found_list)
        }), 400
    
    fields_validation_list = []

    if not isinstance(data['price_per_minute'], (int, float)):
        fields_validation_list.append('"price_per_minute" must be a real number greater than 0 and less than or equal to 3.')
    elif not 1 <= data['price_per_minute'] <= 3:
        fields_validation_list.append('price_per_minute must be greater than 0 and less than or equal to 3.')

    if not isinstance(data['number_of_spots'], int):
        fields_validation_list.append('"number_of_spots" must be an integer.')
    elif not 0 <= data['number_of_spots'] <= 30:
        fields_validation_list.append('number_of_spots must be an integer from 0 to 30.')

    if fields_validation_list:
        return jsonify({
            'message' : ' '.join(fields_validation_list) + ' ' + 'Please follow the format rules.'
        }), 400

    parking_lot.price_per_minute = data['price_per_minute']

    if not parking_lot.number_of_spots == data['number_of_spots']:
        no_of_available_spots = ParkingSpot.query.filter(
            ParkingSpot.lot_id == parking_lot.id,
            ParkingSpot.status == 'available',
            ParkingSpot.useable == True
        ).count()
        no_of_reserved_spots = ParkingSpot.query.filter(
            ParkingSpot.lot_id == parking_lot.id,
            or_(ParkingSpot.status == 'booked', ParkingSpot.status == 'occupied'),
            ParkingSpot.useable == True
        ).count()

        if data['number_of_spots'] < no_of_reserved_spots:
            return jsonify({
                'message' : '"number_of_spots" cannot be less than the number of spots currently reserved.'
            }), 400
        
        elif data['number_of_spots'] == no_of_reserved_spots:
            temp = ParkingSpot.query.filter(
                ParkingSpot.lot_id == parking_lot.id,
                ParkingSpot.status == 'available',
                ParkingSpot.useable == True
            ).all()
            for i in temp:
                i.useable = False
        
        else:
            new_no_of_available_spots = data['number_of_spots'] - no_of_reserved_spots
            
            if new_no_of_available_spots < no_of_available_spots:
                temp = ParkingSpot.query.filter(
                    ParkingSpot.lot_id == parking_lot.id,
                    ParkingSpot.status == 'available',
                    ParkingSpot.useable == True
                ).all()
                for i in range(no_of_available_spots - new_no_of_available_spots):
                    temp[i].useable = False
            
            elif new_no_of_available_spots > no_of_available_spots:
                diff = new_no_of_available_spots - no_of_available_spots
                temp = ParkingSpot.query.filter(
                    ParkingSpot.lot_id == parking_lot.id,
                    ParkingSpot.useable == False
                ).all()
                while diff > 0 and temp != []:
                    temp.pop().useable = True
                    diff -= 1
                while diff > 0:
                    db.session.add(
                        ParkingSpot(
                            lot_id = data['lot_id'],
                            status = 'available',
                            useable = True
                        )
                    )
                    diff -= 1
        
        parking_lot.number_of_spots = data['number_of_spots']

    db.session.commit()

    cache.delete('parking_lots_details')

    return jsonify({
        'message' : 'Changes succuessfully updates'
    }), 200

@app.route('/api/admin/delete_lot', methods = ['DELETE'])
@auth_required('token')
@roles_required('admin')
def admin_delete_lot():
    data = request.get_json()

    if 'lot_id' not in data.keys():
        return jsonify({
            'message' : '"lot_id" key not found in json.'
        }), 400
    
    if not isinstance(data['lot_id'], int):
        return jsonify({
            'message' : '"lot_id" must be an integer.'
        }), 400

    parking_lot = ParkingLot.query.filter(ParkingLot.id == data['lot_id'], ParkingLot.useable == True).first()

    if not parking_lot:
        return jsonify({
            'message' : 'Given "lot_id" does not exist in the database'
        }), 400
    
    no_of_reserved_spots = ParkingSpot.query.filter(
        ParkingSpot.lot_id == data['lot_id'],
        or_(ParkingSpot.status == 'booked', ParkingSpot.status == 'occupied'),
        ParkingSpot.useable == True
    ).count()

    if no_of_reserved_spots != 0:
        return jsonify({
            'message' : 'Some spots are reserved. Cannot delete the parking lot now.'
        }), 400
    
    for i in ParkingSpot.query.filter(ParkingSpot.lot_id == data['lot_id']).all():
        i.useable = False
    
    parking_lot.useable = False
    db.session.commit()

    cache.delete('parking_lots_details')

    return jsonify({
        'message' : 'Parking lot successfully deleted'
    }), 200


@app.route('/api/admin/parking_spot_details/<int:spot_id>')
@auth_required('token')
@roles_required('admin')
def admin_parking_spot_details(spot_id):
    parking_spot = ParkingSpot.query.filter(ParkingSpot.id == spot_id, ParkingSpot.useable == True).first()
    
    if (not parking_spot):
        return jsonify({
            'message' : 'Given "spot_id" does not exist in the database'
        }), 400 
    
    if parking_spot.status != 'booked' and parking_spot.status != 'occupied':
        return jsonify({
            'message' : 'This spot is neither booked nor occupied currently.'
        }), 400

    parking_lot = ParkingLot.query.get(parking_spot.lot_id)    
    
    temp = ReserveParkingSpot.query.filter(
        ReserveParkingSpot.spot_id == parking_spot.id,
        ReserveParkingSpot.leaving_timestamp == None
    ).first()

    return jsonify({
        'id' : parking_spot.id,
        'lot_id' : parking_lot.id,
        'status' : parking_spot.status,
        'prime_location_name' : parking_lot.prime_location_name,
        'price_per_minute' : parking_lot.price_per_minute,
        'pincode' : parking_lot.pincode,
        'address' : parking_lot.address,
        'current_parking_details' : {
            'booking_id' : temp.id,
            'user_id' : temp.user_id,
            'vehicle_no': temp.vehicle_no,
            'price_per_minute' : temp.price_per_minute,
            'booking_timestamp' : get_time_str(temp.booking_timestamp), 
            'parking_timestamp' : get_time_str(temp.parking_timestamp), 
            'leaving_timestamp' : get_time_str(temp.leaving_timestamp), 
            'parking_cost' : temp.parking_cost
        }
    }), 200

@app.route('/api/admin/users')
@auth_required('token')
@roles_required('admin')
def admin_users():
    return jsonify([{
        'id' : i.id,
        'name' : i.name,
        'email' : i.email,
        'overall_no_of_spots_booked' : len(i.reserve_parking_spots) 
    } for i in User.query.filter(User.email != 'superuser@admin.com').all()]), 200

@app.route('/api/admin/user_details/<int:user_id>')
@auth_required('token')
@roles_required('admin')
def admin_user_details(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'message' : 'User not found.'
        }), 400
    
    return jsonify({
        'user_name' : user.name,
        'user_email' : user.email,
        'parking_details' : [{
            'booking_id' : j.id,
            'vehicle_no' : j.vehicle_no,
            'price_per_minute' : j.price_per_minute,
            'booking_timestamp' : get_time_str(j.booking_timestamp), 
            'parking_timestamp' : get_time_str(j.parking_timestamp), 
            'leaving_timestamp' : get_time_str(j.leaving_timestamp), 
            'parking_cost' : j.parking_cost,
            'prime_location_name' : j.parking_spot.parking_lot.prime_location_name,
            'pincode' : j.parking_spot.parking_lot.pincode,
            'address' : j.parking_spot.parking_lot.address
        } for j in user.reserve_parking_spots]
    }), 200

@app.route('/api/admin/analytics')
@auth_required('token')
@roles_required('admin')
def admin_analytics():
    data = {}
    for booked_spot in ReserveParkingSpot.query.all():
        prime_location_name = booked_spot.parking_spot.parking_lot.prime_location_name
        if prime_location_name in data.keys():
            data[prime_location_name] += 1
        else:
            data[prime_location_name] = 1
    return jsonify(data), 200
