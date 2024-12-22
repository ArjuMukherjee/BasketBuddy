from flask import Flask
from flask_security import Security
from application.resources import api
from application.model import db, User, Role
from config import LocalDevelopmentConfig
from application.sec import datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import daily_remainder, monthly_remainder
from application.instance import cache

def create_app():
    app = Flask(__name__,template_folder='templates')
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    cache.init_app(app)
    app.security = Security(app, datastore)
    with app.app_context():
        import application.controllers
    return app

app = create_app()
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=18, minute=00),
        daily_remainder.s('Forgot to Login?? BusketBuddy is waiting for you!','<html>BasketBuddy is waiting for you!</html>'),
    )
    sender.add_periodic_task(
        crontab(hour=16,minute=00,day_of_month=1),
        monthly_remainder.s(),
    )

if __name__ == '__main__':
    app.run(debug=True)