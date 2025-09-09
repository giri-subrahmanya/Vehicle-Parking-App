from flask import current_app as app, jsonify
from flask_security import auth_required, current_user
from sqlalchemy import or_
from application.models import ParkingLot, ParkingSpot
from application.database import db
from application.cache import cache

@app.route('/api/parking_lots_details')
@cache.cached(timeout = 40, key_prefix = 'parking_lots_details')
@auth_required('token')
def parking_lots_details():
    temp = ParkingLot.query.filter(ParkingLot.useable == True).all()
    parking_lots = []
    for i in temp:
        no_of_available_spots = ParkingSpot.query.filter(
            ParkingSpot.lot_id == i.id,
            ParkingSpot.status == 'available',
            ParkingSpot.useable == True
        ).count()
        no_of_reserved_spots = ParkingSpot.query.filter(
            ParkingSpot.lot_id == i.id,
            or_(ParkingSpot.status == 'booked', ParkingSpot.status == 'occupied'),
            ParkingSpot.useable == True
        ).count()
        parking_lots.append({
            'id' : i.id,
            'prime_location_name' : i.prime_location_name,
            'price_per_minute' : i.price_per_minute,
            'number_of_spots' : i.number_of_spots,
            'pincode' : i.pincode,
            'address' : i.address,
            'no_of_reserved_spots' : no_of_reserved_spots,
            'no_of_available_spots' : no_of_available_spots
        })
    return jsonify(parking_lots), 200