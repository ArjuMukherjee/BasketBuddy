from flask import current_app as app, jsonify, render_template, request, send_file
from flask_login import login_required, logout_user
from flask_security import auth_required, roles_required, current_user, roles_accepted
from .sec import datastore
from werkzeug.security import check_password_hash,generate_password_hash
from application.model import db,PersonalDetails,Role, Category, Product, Cart, Sales, Log
from flask_restful import fields,marshal
from datetime import date, timedelta
from sqlalchemy import and_
from .tasks import create_products_csv, create_categories_csv
from celery.result import AsyncResult
import matplotlib.pyplot as plt


class todate(fields.Raw):
    def format(self, value):
        return {
            'year' : value.year,
            'month' : value.month,
            'day' : value.day
        }

products_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'expiry_date': todate,
    'active': fields.Boolean
}


@app.get('/')
def home():
    return render_template('index.html')

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message":"Email not provided!"}), 400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message":"User not found!"}),404
    if not user.active:
        return jsonify({"message":"User not allowed"}),401
    if check_password_hash(user.password,data.get('password')):
        db.session.add(
            Log(
                user_id = user.id,
                date = date.today(),
                state = 'IN'
            )
        )
        db.session.commit()
        return jsonify({"token": user.get_auth_token(),"email":user.email,"role": user.roles[0].name})
    else:
        return jsonify({"message":"Wrong Password!"}),400

@app.post('/user-register')
def user_register():
    data = request.get_json()
    email = data.get('email')
    f_name = data.get('first_name')
    m_name = data.get('middle_name')
    l_name = data.get('last_name')
    username = data.get('username')
    address = data.get('address')
    phno = data.get('phno')
    role = data.get('role')
    pin = data.get('pin')

    password = data.get('password')
    if not f_name:
        return jsonify({"message":"First Name not provided!"}), 400
    elif not l_name:
        return jsonify({"message":"Last Name not provided!"}),400
    elif not address:
        return jsonify({"message":"Address not provided!"}),400
    elif not pin:
        return jsonify({"message":"Pin not provided!"}),400
    elif not phno:
        return jsonify({"message":"Phone Number not provided!"}),400
    elif not username:
        return jsonify({"message":"Username not provided!"}),400
    elif not email:
        return jsonify({"message":"Email not provided!"}), 400
    elif not password:
        return jsonify({"message":"Password not provided!"}),400
    elif not role:
        return jsonify({"message":"Role not provided!"}),400
    elif role == 'admin':
        return jsonify({"message":"Not authorized"}),401
    if not datastore.find_user(email=email):
        db.session.add(
            PersonalDetails(
                address = address,
                Phone_no = phno,
                first_name = f_name,
                middle_name = m_name,
                last_name = l_name,
                pin = pin
            )
        )
        db.session.commit()
        p_id = PersonalDetails.query.filter_by(Phone_no=phno).first().id
        active = True
        if(role=='manager'):
            active = False
        datastore.create_user(email=email,password=generate_password_hash(password),active=active,username=username,personal_id=p_id,roles=[role])
    else:
        return jsonify({"message":"User already exists!"}),409
    db.session.commit()
    return jsonify({"email":email,"role": role}),200
    
@app.post('/activate/manager/<int:id>')
@auth_required('token')
@roles_required('admin')
def activate_manager(id):
    user = datastore.find_user(id=id)
    if not user:
        return jsonify({"message":"Manager Not Found!"}),404
    datastore.activate_user(user)
    try:
        db.session.commit()
    except:
        return jsonify({"message":"Internal Error!"}),500
    return jsonify({"message":"Manager Activated!"}),200

@app.post('/deactivate/manager/<int:id>')
@auth_required('token')
@roles_required('admin')
def deactivate_manager(id):
    user = datastore.find_user(id=id)
    if not user:
        return jsonify({"message":"Manager Not Found!"}),404
    datastore.deactivate_user(user)
    try:
        db.session.commit()
    except:
        return jsonify({"message":"Internal Error!"}),500
    return jsonify({"message":"Manager Activated!"}),200

@app.post('/activate/category/<int:id>')
@auth_required('token')
@roles_required('admin')
def activate_category(id):
    category = Category.query.filter_by(id=id).first()
    if not category:
        return jsonify({"message":"Category Not Found!"}),404
    category.active = True
    try:
        db.session.commit()
    except:
        return jsonify({"message":"Internal Error!"}),500
    return jsonify({"message":"Category Activated!"}),200

@app.post('/deactivate/category/<int:id>')
@auth_required('token')
@roles_required('admin')
def deactivate_category(id):
    category = Category.query.filter_by(id=id).first()
    if not category:
        return jsonify({"message":"Category Not Found!"}),404
    category.active = False
    for product in category.products.all():
        product.active = False
    try:
        db.session.commit()
    except:
        return jsonify({"message":"Internal Error!"}),500
    return jsonify({"message":"Category Deactivated!"}),200

user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean
}

@app.get('/managers')
@auth_required('token')
@roles_required('admin')
def managers_list():
    users = Role.query.filter_by(name='manager').first().users.all()
    if(len(users) == 0):
        return jsonify({"message":"No Managers Found"}),404
    return marshal(users,user_fields)

@app.get('/product/details/<int:id>')
@auth_required('token')
@roles_accepted('customer','manager')
def prod_details(id):
    product = Product.query.filter_by(id = id).first()
    if(product):
        return jsonify({
            'name': product.name,
            'description': product.description,
            'img_url': product.img_url,
            'mfg_date': str(product.mfg_date),
            'quantity': product.quantity,
            'expiry_date': str(product.expiry_date),
            'price': product.price,
            'unit': product.unit
        })
    else:
        return jsonify({"message":"Product Not Found!"}),404
    
@app.post('/add-to-cart')
@auth_required('token')
@roles_required('customer')
def addtocart():
    data = request.get_json()
    user_id = current_user.id
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    flag = data.get('flag')
    product = Product.query.filter_by(id = product_id).first()
    if not product:
        return jsonify({"message":"Product Not Found!"}),404
    if int(quantity)<0:
        return jsonify({"message":"Invalid Input!"}),409
    try:
        cart = Cart.query.filter_by(product_id=product_id,user_id=user_id).first()
        if not cart:
            db.session.add(
                Cart(
                    user_id = user_id,
                    product_id = product_id,
                    quantity = quantity
                )
            )
        else:
            if(flag):
                cart.quantity = quantity
            else:
                cart.quantity += quantity
    except:
        db.session.rollback()
        return jsonify({"message":"Internal Error!"}),500
    db.session.commit()
    return jsonify({"message":"Added to cart successfully!"})

@app.get('/cart')
@auth_required('token')
@roles_required('customer')
def cart():
    user_id = current_user.id
    user_cart = Cart.query.filter_by(user_id=user_id).all()
    if not user_cart:
        return jsonify({"message":"Cart empty!"}),404
    cart_details = {}
    for product in user_cart:
        cart_details[product.product_id] = product.quantity
    products = Product.query.filter(Product.id.in_(cart_details.keys())).all()
    res = {}
    for product in products:
        res[product.id] = {"name":product.name,"quantity":cart_details[product.id],"price":product.price,"unit":product.unit}
    return jsonify(res)

@app.post('/buy')
@auth_required('token')
@roles_required('customer')
def bought():
    user_id = current_user.id
    cart = {}
    carts = Cart.query.filter_by(user_id=user_id).all()
    for entry in carts:
        cart[entry.product_id] = entry.quantity
    products = Product.query.filter(Product.id.in_(cart.keys())).all()
    for product in products:
        if product.quantity < cart[product.id]:
            return jsonify({"message": product.name + " not Available!"}),409
        try:
            product.quantity -= cart[entry.product_id]
            db.session.add(
                Sales(
                    user_id = user_id,
                    item_id = product.id,
                    item_price = product.price,
                    quantity = cart[product.id],
                    bill = product.price * cart[product.id],
                    date = date.today()
                )
            )
        except:
            db.session.rollback()
            return jsonify({"message":"Internal error!"}),500
    db.session.query(Cart).filter(Cart.user_id==user_id).delete()
    db.session.commit()
    return jsonify({"message":"Bought Successfully!"})

@app.delete('/remove/<int:prod_id>/cart')
@auth_required('token')
@roles_required('customer')
def removecartprod(prod_id):
    user_id = current_user.id
    if not prod_id:
        return jsonify({"message":"Product not Found!"}),404
    try:
        db.session.query(Cart).filter(and_(Cart.user_id==user_id,Cart.product_id==prod_id)).delete()
    except:
        db.session.rollback()
        return jsonify({"message":"Internal error!"}),500
    db.session.commit()
    return jsonify({"message":"Removed Successfully"})

@app.get('/products/manager')
@auth_required('token')
@roles_required('manager')
def productsmanager():
    try:
        product = Product.query.filter_by(creator_id=current_user.id).all()
    except:
        return jsonify({"message":"Internal Error!"}),500
    if not product:
        return jsonify({"message":"Product not found!"}),404
    return marshal(product,products_fields)

@app.post('/activate/product/<int:id>')
@auth_required('token')
@roles_required('manager')
def activateprod(id):
    product = Product.query.filter_by(id=id).first()
    if not product:
        return jsonify({"message":"Product not found!"}),404
    try:
        product.active = True
    except:
        db.session.rollback()
        return jsonify({"message":"Internal Error!"}),500
    db.session.commit()
    return jsonify({"message":"Successfully activated!"})

@app.post('/deactivate/product/<int:id>')
@auth_required('token')
@roles_required('manager')
def deactivateprod(id):
    product = Product.query.filter_by(id=id).first()
    if not product:
        return jsonify({"message":"Product not found!"}),404
    try:
        product.active = False
    except:
        db.session.rollback()
        return jsonify({"message":"Internal Error!"}),500
    db.session.commit()
    return jsonify({"message":"Successfully deactivated!"})

@app.post('/deactivate-expired-products')
@auth_required('token')
@roles_required('manager')
def deactivateallexpiredpord():
    products = Product.query.filter(and_(Product.creator_id==current_user.id,Product.active==True,Product.expiry_date<date.today())).all()
    try:
        for product in products:
            product.active = False
    except:
        db.session.rollback()
        return jsonify({"message":"Internal Error!"}),500
    db.session.commit()
    return jsonify({"message":"Successfully deactivated"})

@app.get('/category/name/<int:id>')
@auth_required('token')
@roles_required('admin')
def catgname(id):
    category = Category.query.filter_by(id=id).first()
    if not category:
        return jsonify({"message":"category not found!"}),404
    return jsonify({"name":category.name})

@app.get('/download/product-details/<int:id>')
@auth_required('token')
@roles_required('manager')
def downloadproductdetails(id):
    user_id = current_user.id
    task = create_products_csv.delay(id,user_id)
    return jsonify({"taskId":task.id})

@app.get('/get-product-details-csv/<task_id>')
def getproddetailscsv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404

@app.get('/download/store-details')
@auth_required('token')
@roles_required('admin')
def downloadstoredetails():
    task = create_categories_csv.delay()
    return jsonify({"taskId":task.id})

@app.get('/get-store-details-csv/<task_id>')
def getstoredetailscsv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404

@app.get('/summary')
def summary():
    print(1)
    catg_dict = dict()
    categories = db.session.query(Category).all()
    for category in categories:
        name = category.name
        catg_dict[name] = 0
    items = db.session.query(Product).all()
    for item in items:
        name = item.category[0].name
        catg_dict[name] += 1
    x = list(catg_dict.keys())
    y = list(catg_dict.values())
    print(x,y)
    plt.figure(figsize=(12,12))
    plt.bar(x,y)
    plt.title('category-wise products')
    plt.xticks(rotation = 45)
    plt.savefig('static/catgwiseprod.jpg')
    plt.clf()

    sales_dict = dict()
    dates = [date.today()]
    for i in range(0,6):
        dates.append(dates[i]- timedelta(days=1))
    sales = db.session.query(Sales).filter(Sales.date.in_(dates)).all()
    print(sales)
    for sale in sales:
        print(sale)
        if(sale):
            item_id = sale.item_id
            item_name = Product.query.filter_by(id=item_id).first()
            if not item_name:
                item_name = "Deleted"
            else:
                item_name = item_name.name
            if item_name in sales_dict:
                sales_dict[item_name] += sale.quantity
            else:
                sales_dict[item_name] = sale.quantity
    x = list(sales_dict.keys())
    y = list(sales_dict.values())
    plt.figure(figsize=(12,10))
    plt.bar(x,y)
    plt.title('Products bought last week')
    plt.xticks(rotation = 45)
    plt.savefig('static/saleslastweek.jpg')
    plt.close()
    return jsonify({"message":"Ok!"})
    
@app.post('/log-out')
@auth_required('token')
def logout():
    db.session.add(
        Log(
            user_id = current_user.id,
            date = date.today(),
            state = 'OUT'
        )
    )
    db.session.commit()
    return jsonify({"message":"logged out!"})