export default{
    props: ['id'],
    template: `
<div>
  <div class="text-danger">{{error}}</div>
  <div class="p-2 mt-5">
      <div class="row">
          <div class="col-6">
              <div class="h-200 flex-column align-items-stretch pe-4 border-end">
                  <img src="../static/images/orange.jpg" class="img-fluid">
              </div>
          </div>
      
          <div class="col-6">
          <div data-bs-spy="scroll" data-bs-target="#navbar-example3" data-bs-smooth-scroll="true" class="scrollspy-example-2" tabindex="0">
              <div id="item-1">
              <h4>{{product.name}}</h4>
              </div>
              <br>
              <div id="item-1-1">
              <h5 v-if="product.quantity>5">In Stock!</h5>
              <h5 v-else-if="product.quantity>0">Only {{product.quantity}} left!!</h5>
              <h5 v-else>Out of Stock!</h5><br>
              <p>{{product.mfg_date}} to {{product.expiry_date}}</p>
              </div>
              <br>
              <div id="item-1-2">
              <h5>₹{{product.price}} {{product.unit}}</h5>
              </div>
              <br>
              <br>
              <p>Descripion</p>
              <div id="item-2" v-html="product.description" class="fw-semibold">
              </div>
          </div>
          </div>
      </div>
  </div>
  <button class="container-fluid btn btn-primary footer" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample" @click="addtocart">
  Add To Cart
</button>

<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasExampleLabel">Cart</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
   <table class="table">
    <thead>
        <tr>
        <th scope="col">Products</th>
        <th scope="col">Quantity</th>
        <th scope="col">Price</th>
        <th scope="col">Total</th>
        </tr>
    </thead>
    <tbody v-for="(products,index) in cart">
        <tr>
            <td scope="row">{{products.name}}</td>
            <td>
                <button @click="decrement(index)">-</button><input type="text" :value="products.quantity" size="1" readonly><button @click="increment(index)">+</button>
            </td>
            <td>{{products.price}}</td>
            <td>{{total_price[products.name]}}</td>
        </tr>
    </tbody>
   </table>
   <div style="position:fixed; bottom: 3%;">
    <button class="btn btn-primary" type="button" @click="savecart(false)" data-bs-dismiss="offcanvas">Save</button>   <button class="btn btn-success" type="button" @click="savecart(true);" data-bs-dismiss="offcanvas">Buy</button>
   </div>
  </div>
</div>
</div>

    `,
    data: function(){
        return{
            product: {
                name: null,
                quantity: null,
                price: null,
                unit: null,
                description: null,
                mfg_date: null,
                expiry_date: null
            },
            error: null,
            token: localStorage.getItem('auth-token'),
            cart: null,
            has_changed: false,
            total_price: {}
        }
    },
    watch:{
        cart: function(){
            if(this.cart){
                for(let products in this.cart){
                    let product = this.cart[products]
                    this.total_price[product.name] = (product.price * product.quantity).toFixed(2);
                }
            }
        },
    },
    async mounted(){
        const res = await fetch(`/product/details/${this.id}`,{
            headers:{
                'Authentication-Token': this.token
            }
        });
        const data = await res.json();
        if(res.ok){
            this.product.name = data.name;
            this.product.quantity = data.quantity;
            this.product.price = data.price;
            this.product.unit = data.unit;
            this.product.description = data.description;
            this.product.mfg_date = data.mfg_date;
            this.product.expiry_date = data.expiry_date;
        }else{
            this.error = data.message;
        }
    },
    methods:{
        async savecart(flag){
            for(const prod in this.cart){
                let product = this.cart[prod]
                const res = await fetch('/add-to-cart',{
                    method: 'POST',
                    headers: {
                        'Authentication-Token': this.token,
                        'Content-type' : "application/json",
                    },
                    body: JSON.stringify({
                        product_id: prod,
                        quantity: product.quantity,
                        flag: true,
                    })
                });
                const data = await res.json();
                if(!res.ok){
                    this.error = data.message;
                }
            }
            if(flag) this.buy();
        },
        async addtocart(){
            const res = await fetch('/add-to-cart',{
                method: 'POST',
                headers: {
                    'Authentication-Token': this.token,
                    'Content-type' : "application/json",
                },
                body: JSON.stringify({
                    product_id: this.id,
                    quantity: 1,
                    flag: false,
                })
            });
            const data = await res.json();
            if(res.ok){
                const res1 = await fetch('/cart',{
                    headers: {
                        'Authentication-Token': this.token
                    }
                });
                const data1 = await res1.json();
                if(res1.ok){
                    this.cart = data1;
                }else{
                    this.error = data1.message;
                }
            }else{
                this.error = data.message;
            }
            this.has_changed = !this.has_changed       
        },
        increment(index){
            this.cart[index].quantity++;
            this.total_price[this.cart[index].name] = (this.cart[index].price * this.cart[index].quantity).toFixed(2);

        },
        decrement(index){
            this.cart[index].quantity--;
            this.total_price[this.cart[index].name] = (this.cart[index].price * this.cart[index].quantity).toFixed(2);
        },
        buy(){
            this.$router.push('/user/cart');
        }
    }
}