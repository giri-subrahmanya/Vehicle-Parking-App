# Vehicle-Parking-App
A full-stack Vehicle Parking App that allows users to register, browse parking locations, and book spots efficiently. Admins can manage lots and users, while users enjoy seamless booking and reporting features.

## Tech Stack
- Backend: Flask
- Security: Flask-Security for token-based authentication and role-based access control
- Password Hashing: Werkzeug
- Database: SQLite (accessed using Flask-SQLAlchemy)
- Frontend: VueJS (CDN) with Vue Router
- HTML
- Bootstrap
- Asynchronous Tasks: Celery (scheduled and user-triggered) with Redis as message broker
- Cache: Flask-Cache with Redis as database
- Summary Charts: Plotly.js
- Webhooks: Google Chat Webhooks

## Admin Functionalities
- View all parking lots and their parking history
- Add, edit, and delete parking lots
- View all users and their parking history
- Search functionality: search users by email, search parking lots by location name
- View summary charts

## User Functionalities
- Register and login
- View list of parking lots
- Book, park, and vacate parking spots
- View summary charts
- Download parking history as CSV report

## Other Functionalities
- Scheduled emails (via MailHog) can be sent using Celery worker and Celery beat
- Scheduled webhook messages can be sent using Google Chat webhooks via Celery worker and Celery beat
- CSV report downloads via user-triggered asynchronous tasks using Celery worker; API polling is implemented in frontend for downloading reports

## Steps to Run

**STEP-1:** Open six terminals  
**STEP-2:** Execute `python3 app.py` in Terminal-1  
**STEP-3:** Execute `sudo service redis-server start` in Terminal-2, then run `redis-cli ping` (should show `PONG`)  
**STEP-4:** Execute `MailHog` in Terminal-3  
**STEP-5:** Execute `celery -A app.celery_app worker --loglevel=info` in Terminal-4  
**STEP-6:** Execute `celery -A app.celery_app beat --loglevel=info` in Terminal-5  

## Demo Video
Video Demo of the Vehicle-Parking-App: [Link](https://drive.google.com/file/d/1_mio3P0St6OblLFCE77RrjeeFFSb4cyA/view?usp=sharing)
