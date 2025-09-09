from flask import Flask, render_template
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from celery.schedules import crontab
from application.config import LocalDevelopmentConfig
from application.database import db
from application.models import *
from application.celery_init import celery_init_app
from application.cache import cache
from application.tasks import *

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    cache.init_app(app)
    app.app_context().push()
    return app

app = create_app()
celery_app = celery_init_app(app)
celery_app.autodiscover_tasks(['application'])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        app.security.datastore.find_or_create_role(
            name = 'admin',
            description = 'Superuser of the app'
        )
        app.security.datastore.find_or_create_role(
            name = 'user',
            description = 'General user of the app'
        )
        db.session.commit()

        if not app.security.datastore.find_user(email = 'superuser@admin.com'):
            app.security.datastore.create_user(
                name = 'Superuser',
                email = 'superuser@admin.com',
                password = generate_password_hash('superuser'),
                roles = ['admin']
            )
            
        db.session.commit()

from application.routes.auth import *
from application.routes.admin import *
from application.routes.user import *
from application.routes.parking_lots import *


@app.route('/')
def home():
    return render_template('index.html')

@celery_app.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*'),
        monthly_activity_report.s(),
    )
    sender.add_periodic_task(
        crontab(minute = '*'),
        daily_reminder.s(),
    )

if __name__ == '__main__':
    app.run()