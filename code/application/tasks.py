from celery import shared_task
from .model import Product,Category, ProductCategory, Sales, Log, User
import flask_excel as excel
from flask_security import current_user
from sqlalchemy import and_
from .mail_service import send_message
from datetime import date
from jinja2 import Template

@shared_task(ignore_result=False)
def create_products_csv(id,c_id):
    product_ids = list(map(lambda x: x.product_id,ProductCategory.query.filter_by(category_id=id).all()))
    products = Product.query.filter(Product.id.in_(product_ids),Product.creator_id==c_id).all()
    for product in products:
        sale = Sales.query.filter_by(item_id=product.id).first()
        if sale:
            product.sold = sale.quantity
            product.bill = sale.bill
        else:
            product.sold = None
            product.bill = None
    csv_output = excel.make_response_from_query_sets(products,["name","description","img_url","quantity","mfg_date","expiry_date","price","unit","active","sold","bill"],"csv")
    filename = products[0].category[0].name + ".csv"
    with open(filename,"wb") as f:
        f.write(csv_output.data)
    return filename

@shared_task(ignore_result=False)
def create_categories_csv():
    categories = Category.query.all()
    for category in categories:
        category.email = category.creator.email
    csv_output = excel.make_response_from_query_sets(categories,["name","email","active"],"csv")
    filename="store-detail.csv"
    with open(filename,"wb") as f:
        f.write(csv_output.data)
    return filename

@shared_task(ignore_result=True)
def daily_remainder(subject,message):
    today_users = list(map(lambda x: x.user_id,Log.query.filter(Log.date==date.today()).all()))
    users = User.query.filter(User.id.not_in(today_users)).all()
    for user in users:
        if user.roles[0].name =='customer':
            send_message(user.email,subject,message)
    return "OK"

@shared_task(ignore_result=False)
def monthly_remainder():
    template = '''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body>
        Monthly Report: {{date}}
        <br>
        <table>
            <tr>
                <th>Email</th>
                <th>Order_details</th>
                <th>Bill</th>
            </tr>
            {% for user in users %}
            <tr>
                <td>{{user['email']}}</td>
                <td>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Quantity</th>
                        </tr>
                    {% for order in user['orders'] %}
                        <tr>
                            <td>{{order['id']}}</td>
                            <td>{{order['date']}}</td>
                            <td>{{order['quantity']}}</td>
                        </tr>
                    {% endfor %}
                    </table>
                </td>
                <td>{{user['bill']}}</td>
            </tr>
            {% endfor %}
        </table>
    </body>
    </html>
    '''
    template = Template(template)
    mydic = []
    users = User.query.all()
    presentdate = date.today()
    if presentdate.month-1 == 0:
        previousmonth = date(presentdate.year-1,12,1)
    else:
        previousmonth = date(presentdate.year,presentdate.month-1,1)
    presentdate = date(presentdate.year,presentdate.month,1)
    for user in users:
        if user.roles[0].name == 'customer':
            orders = Sales.query.filter(Sales.user_id==user.id,Sales.date>=presentdate).all()
            mylist = []
            total_bill = 0
            for order in orders:
                mylist.append({"id":order.id,"date":order.date,"quantity":order.quantity})
                total_bill += float(order.bill)
            mydic.append({"email":user.email,"orders":mylist,"bill":total_bill})
    send_message('admin@email.com','monthly-report',template.render(users=mydic,date=date.today()))
    return "OK"