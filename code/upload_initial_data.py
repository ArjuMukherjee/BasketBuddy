from main import app
from application.model import db,PersonalDetails
from werkzeug.security import generate_password_hash
from application.sec import datastore

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name="admin",description="User is a Admin.")
    datastore.find_or_create_role(name="manager",description="User is a Manager.")
    datastore.find_or_create_role(name="customer",description="User is a Customer.")
    db.session.commit()
    if not datastore.find_user(email="admin@email.com"):
        db.session.add(
            PersonalDetails(
                id = 1,
                address = "Address",
                Phone_no = "999999999",
                first_name = "Arju",
                middle_name = "",
                last_name = "Mukherjee",
                pin = 741250
            )
        )
        db.session.commit()
        datastore.create_user(email="admin@email.com",password=generate_password_hash("Admin@123"),username="Arju",personal_id=1,roles=["admin"])
    db.session.commit()