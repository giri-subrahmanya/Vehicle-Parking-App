from celery import shared_task
import requests as r
import csv
import os
from jinja2 import Template
from datetime import datetime, timezone, timedelta
from application.models import *
from application.mail import send_email
from application.utils import get_time_str

@shared_task(ignore_results = False, name = 'daily_reminder')
def daily_reminder():
    parking_lots = ParkingLot.query.filter(ParkingLot.useable == True).all()
    temp = []
    i = 1
    for lot in parking_lots:
        no_of_available_spots = ParkingSpot.query.filter(
            ParkingSpot.lot_id == lot.id,
            ParkingSpot.status == 'available',
            ParkingSpot.useable == True
        ).count()
        if no_of_available_spots > 0:
            temp.append(
                f'{i}) '
                f'Prime Location Name: {lot.prime_location_name}. '
                f'Price Per Minute: {lot.price_per_minute}. '
                f'Pincode: {lot.pincode}. '
                f'Address: {lot.address}. '
                f'Number of Spots Available: {no_of_available_spots}.'
            )
    message = f'*DAILY REMINDER*.\nBegin your day by booking a spot in the app.\nVisit http://127.0.0.1:5000/#/user\n\n{'\n'.join(temp)}'
    url = 'https://chat.googleapis.com/v1/spaces/AAQAPXqDRKs/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=FKBz3fih1jgY4GwOVhj_ha2Ens7kl-uPW9PWE4_9Rzk'
    res = r.post(
        url = url,
        headers = {'Content-Type': 'application/json'},
        json = {'text' : message}
    )
    return 'Daily Reminder Sent'
    
@shared_task(ignore_results = False, name = 'monthly_activity_report')
def monthly_activity_report():
    users = User.query.filter(User.email != 'superuser@admin.com').all()
    for user in users:
        # seconds = 60 * 60 * 24 * 30 # seconds for 30 days
        seconds = 120 # seconds per minute
        parking_history = []
        location = {}
        total_amount_spent = 0
        for booked_spot in user.reserve_parking_spots:
            current_time = datetime.now(timezone(timedelta(hours=5,minutes=30)))
            diff = (current_time - datetime.fromisoformat(booked_spot.booking_timestamp)).total_seconds()
            if diff <= seconds:
                d = {
                    'booking_id' : booked_spot.id,
                    'vehicle_no': booked_spot.vehicle_no,
                    'price_per_minute' : booked_spot.price_per_minute,
                    'booking_timestamp' : get_time_str(booked_spot.booking_timestamp),
                    'parking_timestamp' : get_time_str(booked_spot.parking_timestamp),
                    'leaving_timestamp' : get_time_str(booked_spot.leaving_timestamp),
                    'parking_cost' : booked_spot.parking_cost,
                    'prime_location_name' : booked_spot.parking_spot.parking_lot.prime_location_name,
                    'pincode' : booked_spot.parking_spot.parking_lot.pincode,
                    'address' : booked_spot.parking_spot.parking_lot.address
                }
                parking_history.append(d)

                if d['prime_location_name'] in location.keys():
                    location[d['prime_location_name']] += 1
                else:
                    location[d['prime_location_name']] = 1

                if d['parking_cost']:
                    total_amount_spent += d['parking_cost']
        
        if parking_history:
            with open('templates/mail.html','r') as f:
                message = Template(f.read()).render(
                    name = user.name,
                    email = user.email,
                    user_id = user.id,
                    time = current_time.isoformat(),
                    parking_history = parking_history,
                    location = location,
                    total_amount_spent = total_amount_spent
                )
            content = 'html'
            with open('a','w') as f:
                f.write(message)
        else:
            message = (
                f'Dear {user.name}, in the last one month, you have not booked any spot.'
                'To book a spot, visit http://127.0.0.1:5000/#/user Thank you.'    
            )
            content = 'plain'
        
        send_email(
            to_address = user.email,
            subject = 'Monthly Activity Report - Vehicle Parking App',
            message = message,
            content = content
        )
        
    return 'Monthly Activity Report Sent'
                

@shared_task(ignore_results = False, name = 'csv_report')
def csv_report(user_id):
    user = User.query.get(user_id)
    temp = []
    for i in user.reserve_parking_spots:
        if i.leaving_timestamp:
            temp.append({
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
    filename = f'parking_details_{user_id}_{datetime.now(timezone(timedelta(hours=5,minutes=30))).strftime('%Y%m%d_%H%M%S_%f')}.csv'
    os.makedirs('csv', exist_ok=True)
    with open(f'csv/{filename}', 'w', newline = "") as f:
        writer = csv.DictWriter(f, fieldnames = ['booking_id','vehicle_no','price_per_minute','booking_timestamp','parking_timestamp','leaving_timestamp','parking_cost','prime_location_name','pincode','address'])
        writer.writeheader()
        writer.writerows(temp)
    return filename

