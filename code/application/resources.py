from sqlalchemy import or_
from flask_restful import Resource,Api,marshal,fields, reqparse
from flask_security import auth_required, roles_required, roles_accepted, current_user
from flask import jsonify, request
from .model import Product,Category,db,ProductCategory
from datetime import date

api = Api(prefix = '/api')

#-----------------product_parser------------------#
product_parser = reqparse.RequestParser()
product_parser.add_argument('name')
product_parser.add_argument('description')
product_parser.add_argument('img_url')
product_parser.add_argument('mfg_date')
product_parser.add_argument('expiry_date')
product_parser.add_argument('quantity')
product_parser.add_argument('unit')
product_parser.add_argument('price')
product_parser.add_argument('category_name')


class toCategory(fields.Raw):
    def format(self, category):
        value = category[0]
        return {
            'id': value.id,
            'name': value.name,
            'active': value.active
        }

class todate(fields.Raw):
    def format(self, value):
        return {
            'year' : value.year,
            'month' : value.month,
            'day' : value.day
        }

class toCreator(fields.Raw):
    def format(self, value):
        return value.email

def without_keys(d, keys):
    return {x: d[x] for x in d if x not in keys}
def toDate(str):
    y,m,d = list(map(int,str.split('-')))
    return date(y, m, d)

products_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description':fields.String,
    'img_url':fields.String,
    'quantity': fields.Integer,
    'mfg_date': todate,
    'expiry_date': todate,
    'price': fields.Raw,
    'unit': fields.String,
    'category': toCategory,
    'active': fields.Boolean,
    'creator': toCreator
}

class Products(Resource):

    @auth_required('token')
    @roles_accepted('manager','admin','customer')
    def get(self):
        try:
            if "admin" in current_user.roles:
                product = Product.query.all()
                return marshal(product,products_fields)
            else:
                product = Product.query.filter(or_(Product.active == True, Product.creator == current_user)).all()
                return marshal(product,without_keys(products_fields,{'creator'}))
        except:
            return {"message":"Internal Server Error!"},500
    
    @auth_required('token')
    @roles_required('manager')
    def post(self):
        args = product_parser.parse_args()
        name = args.get('name')
        description = args.get('description')
        img_url = args.get('img_url')
        mfg_date = toDate(args.get('mfg_date'))
        expiry_date = toDate(args.get('expiry_date'))
        quantity = args.get('quantity')
        unit = args.get('unit')
        price = args.get('price')
        category_name = args.get('category_name')
        print(mfg_date)
        catg_id = Category.query.filter_by(name=category_name).first().id
        creator_id = current_user.id
        product = Product.query.filter_by(
                name = name,
                description = description,
                img_url = img_url,
                mfg_date = mfg_date,
                expiry_date = expiry_date,
                unit = unit,
                price = price,
                creator_id = creator_id,
            ).first()
        if product:
            if product.active:
                return {"message":"Already Exist!"},409
            else:
                return {"message":"Already in Queue!"},409
        try:
            db.session.add(
                Product(
                    name = name,
                    description = description,
                    img_url = img_url,
                    mfg_date = mfg_date,
                    expiry_date = expiry_date,
                    quantity = quantity,
                    unit = unit,
                    price = price,
                    creator_id = creator_id,
                    active = False
                )
            )
            product = Product.query.filter_by(
                name = name,
                description = description,
                img_url = img_url,
                mfg_date = mfg_date,
                expiry_date = expiry_date,
                unit = unit,
                price = price,
                creator_id = creator_id,
            ).first()
            product_id = product.id
            db.session.add(
                ProductCategory(
                    product_id = product_id,
                    category_id = catg_id
                )
            )
        except:
            db.session.rollback()
            return {"message":"Internal server Error!"},500
        db.session.commit()
        return marshal(product,products_fields)
    
    @auth_required('token')
    @roles_required('manager')
    def put(self,id):
        product = Product.query.filter_by(id=id).first()
        if not product:
            return {"message":"Product not found!"},404
        data = product_parser.parse_args()
        name = data.get('name')
        description = data.get('description')
        img_url = data.get('img_url')
        mfg_date = toDate(data.get('mfg_date'))
        expiry_date = toDate(data.get('expiry_date'))
        quantity = data.get('quantity')
        unit = data.get('unit')
        price = data.get('price')
        try:
            product.name = name
            product.description = description
            product.img_url = img_url
            product.mfg_date = mfg_date
            product.expiry_date = expiry_date
            product.quantity = quantity
            product.unit = unit
            product.price = price
        except:
            db.session.rollback()
            return {"message":"Internal error!"},500
        db.session.commit()
        return {"message":"Successfully updated!"}

    @auth_required('token')
    @roles_required('manager')
    def delete(self,id):
        try:
            product = db.session.query(Product).filter(Product.id==id)
            relation = db.session.query(ProductCategory).filter(ProductCategory.product_id==id)
            if not product:
                return {"message":"Product not found!"},404
            product.delete()
            relation.delete()
        except:
            db.session.rollback()
            return {"message":"Internal Error!"},500
        db.session.commit()
        return {"message":"Product deleted!"}


#-----------------Category_parser------------------#
category_parser = reqparse.RequestParser()
category_parser.add_argument('category_name')

category_fields = {
    'name' : fields.String,
    'id' : fields.Integer,
    'active' : fields.Boolean,
    'creator' : toCreator
}

class Categories(Resource):

    @auth_required('token')
    @roles_accepted('admin','manager','customer')
    def get(self):
        try:
            if "admin" in current_user.roles:
                categories = Category.query.all()
                return marshal(categories,category_fields)
            else:
                categories = Category.query.filter(or_(Category.active == True, Category.creator == current_user)).all()
                return marshal(categories,without_keys(category_fields,{'creator'}))
        except:
            return {"message":"Internal Server Error!"},500

    @auth_required('token')
    @roles_accepted('admin','manager')
    def post(self):
        args = category_parser.parse_args()
        category_name = args.get('category_name')
        creator_id = current_user.id
        active = False
        if 'admin' in current_user.roles:
            active = True
        category = Category.query.filter_by(name=category_name).first()
        if category:
            if category.active:
                return {"message":"Already Exists!"},409
            else:
                return {"message":"Already in Queue!"},409
        try:
            db.session.add(
                Category(
                    creator_id = creator_id,
                    active = active,
                    name = category_name
                )
            )
            catg = Category.query.filter_by(
                creator_id = creator_id,
                active = active,
                name = category_name
            ).first()
        except:
            db.session.rollback()
            return {"message":"Internal Error!"},500
        db.session.commit()
        return marshal(catg,category_fields)
    
    @auth_required('token')
    @roles_required('admin')
    def put(self,id):
        args = category_parser.parse_args()
        category_name = args.get('category_name')
        try:
            category = Category.query.filter_by(id=id).first()
            if not category:
                return {"message":"Category not found!"},404
            category.name = category_name
        except:
            db.session.rollback()
            return {"message":"Category not found!"},500
        db.session.commit()
        return {"message":"Name successfully changed!"}

    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        try:
            category = db.session.query(Category).filter(Category.id==id)
            relations = db.session.query(ProductCategory).filter(ProductCategory.category_id==id)
            product_ids = category.first().products.all()
            lst = []
            for product_id in product_ids:
                lst.append(product_id.id)
            if product_ids:
                products = db.session.query(Product).filter(Product.id.in_(lst))
                products.delete()
            if relations:
                relations.delete()
            category.delete()
        except:
            db.session.rollback()
            return {"message":"Internal error!"},500
        db.session.commit()
        return {"message":"Removed Successfully!"}

api.add_resource(Products,'/products','/products/<int:id>')
api.add_resource(Categories,'/categories','/categories/<int:id>')
