from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class PersonalDetails(db.Model):
    __tablename__='personaldetails'
    id = db.Column(db.Integer,primary_key=True)
    address = db.Column(db.String(255))
    Phone_no = db.Column(db.String(10),nullable=False)
    first_name = db.Column(db.String(255),nullable = False)
    middle_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255),nullable = False)
    pin = db.Column(db.Integer,nullable = False)

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    __tablename__='user'
    id = db.Column(db.Integer,primary_key=True)
    email = db.Column(db.String(255),nullable = False)
    password = db.Column(db.String(255),nullable=False)
    username = db.Column(db.String(255),nullable=False)
    personal_id = db.Column(db.Integer,db.ForeignKey("personaldetails.id"))
    fs_uniquifier = db.Column(db.String(255),unique=True,nullable=False)
    active = db.Column(db.Boolean())
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))
    products = db.relationship('Product',backref = 'creator')
    categories = db.relationship('Category',backref = 'creator')

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class ProductCategory(db.Model):
    __tablename__='products_categories'
    id = db.Column(db.Integer(), primary_key=True)
    product_id = db.Column('product_id', db.Integer(), db.ForeignKey('products.id'))
    category_id = db.Column('category_id', db.Integer(), db.ForeignKey('categories.id'))

class Product(db.Model):
    __tablename__='products'
    id = db.Column(db.Integer,autoincrement=True,primary_key=True)
    name = db.Column(db.String(20),nullable=False)
    description = db.Column(db.String(50))
    img_url = db.Column(db.String(50))
    quantity = db.Column(db.Integer,nullable=False)
    mfg_date = db.Column(db.Date,nullable=False)
    expiry_date = db.Column(db.Date,nullable=False)
    price = db.Column(db.Double,nullable=False)
    unit = db.Column(db.String(10),nullable=False)
    category = db.relationship('Category', secondary='products_categories',
                         backref=db.backref('products', lazy='dynamic'))
    active = db.Column(db.Boolean())
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Category(db.Model):
    __tablename__='categories'
    id = db.Column(db.Integer,autoincrement=True,primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(50),unique=True)
    active = db.Column(db.Boolean())

class Cart(db.Model):
    __tablename__='cart'
    id = db.Column(db.Integer,autoincrement=True,primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

class Sales(db.Model):
    __tablename__='sales'
    id = db.Column(db.Integer,autoincrement=True,primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    item_price = db.Column(db.Double,nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    bill = db.Column(db.Double,nullable=False)
    date = db.Column(db.Date,nullable=False)

class Log(db.Model):
    __tablename___='log'
    id = db.Column(db.Integer,autoincrement=True,primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    date = db.Column(db.Date,nullable=False)
    state = db.Column(db.String,nullable=False)