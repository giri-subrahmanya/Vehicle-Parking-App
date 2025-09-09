from application.database import db
from flask_security import UserMixin, RoleMixin
from sqlalchemy import CheckConstraint

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, nullable = False)
    email = db.Column(db.String, unique = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, nullable = False)
    roles = db.relationship('Role', secondary = 'users_roles', backref = 'users')
    reserve_parking_spots = db.relationship('ReserveParkingSpot', backref = 'user')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String)

class UsersRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class ParkingLot(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    prime_location_name = db.Column(db.String, nullable = False)
    price_per_minute = db.Column(db.Float, nullable = False)
    number_of_spots = db.Column(db.Integer, nullable = False)
    pincode = db.Column(db.Integer, nullable = False)
    address = db.Column(db.String, nullable = False)
    useable = db.Column(db.Boolean, nullable = False)
    parking_spots = db.relationship('ParkingSpot', backref = 'parking_lot')
    __table_args__ = (
        CheckConstraint('1 <= price_per_minute <= 3'),
        CheckConstraint('1 <= LENGTH(prime_location_name) <= 30'),
        CheckConstraint('0 <= number_of_spots <= 30'),
        CheckConstraint('100000 <= pincode <= 999999'),
        CheckConstraint('1 <= LENGTH(address) <= 200'),
    )

class ParkingSpot(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable = False)
    status = db.Column(db.String, nullable = False)
    useable = db.Column(db.Boolean, nullable = False)
    reserve_parking_spots = db.relationship('ReserveParkingSpot', backref = 'parking_spot')
    __table_args__ = (
        CheckConstraint('status = "booked" or status = "occupied" or status = "available"'),
    )

class ReserveParkingSpot(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.id'), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    vehicle_no = db.Column(db.String, nullable = False)
    price_per_minute = db.Column(db.Float, nullable = False)
    booking_timestamp = db.Column(db.String, nullable = False)
    parking_timestamp = db.Column(db.String, nullable = True)
    leaving_timestamp = db.Column(db.String, nullable = True)
    parking_cost = db.Column(db.Float, nullable = True)
    __table_args__ = (
        CheckConstraint('1 <= price_per_minute <= 3'),
    )
