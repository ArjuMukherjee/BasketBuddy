export default{
    template: `
<div :key="has_changed">
    <div class="Cart container-sm">
        <br>
        <div class="container-lg">
            <table class="table table-striped container-lg">
                <thead>
                    <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th style="text-align: center;">Subtotal</th>
                    </tr>
                </thead>
                <tbody v-for="(product,index) in cart">
                    <tr>
                        <td>{{product.name}}</td>
                        <td><input type="text" name="Quantity" v-model="product.quantity" class="iquantity" style="text-align: center;" v-on:keyup="refresh(index)" /></td>
                        <td>{{product.price}}{{product.unit}}</td>
                        <td style="text-align: center;"><input type="text" class="sub_total" :value="total_price[product.name]"
                                style="background: none;border: none;text-align: center;" disabled /></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right;">
                            <div class="btn-group" role="group" aria-label="Basic example">
                                <button type="submit" class="btn btn-primary" style="background: red; border: red;"
                                    name="keys" @click="remove(index,product.name)">Remove</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br>
            <div class="container-lg">
                <h5>Total:&emsp;<span v-html="total"></span></h5>
            </div>
            <div class="container-lg">
                <div class="row">
                    <div class="col" style="text-align: right;">
                        <button type="button" class="btn btn-primary" @click="savecart(true)">Save</button>&emsp;
                        <button type="button" class="btn btn-primary" @click="savecart(false);">Buy</button>
                    </div>
                </div>
            </div>
            <div class="text-danger">{{error}}</div>
        </div>
    </div>
</div>
    `,
    data: function(){
        return {
            token: localStorage.getItem('auth-token'),
            cart: null,
            error: null,
            total_price: {},
            has_changed: false,
            total: 0
        }
    },
    async mounted(){
        const res = await fetch('/cart',{
            headers: {
                'Authentication-Token': this.token
            }
        });
        const data = await res.json();
        if(res.ok){
            this.cart = data;
        }else{
            this.error = data.message;
        }
        for(let products in data){
            let product = data[products];
            this.total_price[product.name] = (product.quantity * product.price).toFixed(2);
            this.total = (parseFloat(this.total) + parseFloat(this.total_price[product.name])).toFixed(2);
        }
    },
    methods: {
        async remove(index,name){
            if(confirm(`Remove ${name} from Cart?`)){
                const res = await fetch(`/remove/${index}/cart`,{
                    method: 'DELETE',
                    headers:{
                        'Authentication-Token': this.token
                    }
                })
                const data = await res.json();
                if(res.ok){
                    delete this.cart[index];
                    this.total = parseFloat(this.total) - parseFloat(this.total_price[name]);
                }else{
                    this.error = data.message;
                }
                this.has_changed = !this.has_changed;
            }
        },
        refresh(index){
            this.total = parseFloat(this.total) - parseFloat(this.total_price[this.cart[index].name]);
            this.total_price[this.cart[index].name] = (this.cart[index].price * this.cart[index].quantity).toFixed(2);
            this.total = (parseFloat(this.total) + parseFloat(this.total_price[this.cart[index].name])).toFixed(2);
            this.has_changed = !this.has_changed;
        },
        async savecart(flag){
            if(this.cart!=null){
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
                if(flag)
                    alert("Cart Saved!");
                else this.buy();
            }
        },
        async buy(){
            if(this.cart!=null)
            if(confirm("Buy Products!")){
                const res = await fetch('/buy',{
                    method: 'POST',
                    headers:{
                        'Authentication-Token': this.token,
                        'Content-type' : "application/json",
                    },
                    body: null
                });
                const data = res.json();
                if(res.ok){
                    alert("Products Bought!");
                    this.$router.push('/');
                }else{
                    this.error = data.message;
                }
            }
        }
    }
}