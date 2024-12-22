export default{
    template: `
<div :key="has_changed">
    <div class="h1 ms-3 mt-3 text-center">Products List</div>
    <div class="text-danger">{{error}}</div>
    <div class="text-center mt-3">
        <button type="button" class="btn btn-info" @click="deactivateexp()" >Deactivate all expired products</button>
    </div>
    <div class="h3 ms-3 mt-5 text-center">Not Approved</div>
    <div class="container mt-5">
        <div class="row" v-for="product in allProducts">
            <div class="col-4 text-center mt-2 me-nt-5" v-if="!activate[product.id]">{{product.name}}</div>
            <div class="col-4 text-center mt-2 me-nt-5" v-if="!activate[product.id]">Exp: {{product.expiry_date.day}}-{{product.expiry_date.month}}-{{product.expiry_date.year}}</div>
            <div class="col-4"><button type="button" v-bind:class="allApproved[product.id]" v-if="!activate[product.id]" @click="approve(product.id)" >{{allApprovals[product.id]}}</button></div>
        </div>
    </div>
    <div class="h3 ms-3 mt-5 text-center">Approved</div>
    <div class="container mt-5">
        <div class="row" v-for="product in allProducts">
            <div class="col-4 text-center mt-2 me-nt-5" v-if="activate[product.id]">{{product.name}}</div>
            <div class="col-4 text-center mt-2 me-nt-5" v-if="activate[product.id]">Exp: {{product.expiry_date.day}}-{{product.expiry_date.month}}-{{product.expiry_date.year}}</div>
            <div class="col-4"><button type="button" v-bind:class="allApproved[product.id]" v-if="activate[product.id]" @click="disapprove(product.id)" >{{allApprovals[product.id]}}</button></div>
        </div>
    </div>
</div>
    `,
    data: function(){
        return{
            has_changed: false,
            allProducts: [],
            token: localStorage.getItem('auth-token'),
            error: null,
            allApprovals: {},
            allApproved: {},
            activate: {}
        }
    },
    async mounted(){
        const res = await fetch('/products/manager',{
            headers:{
                'Authentication-Token': this.token,
                'Content-type' : "application/json"
            }
        });
        const data = await res.json();
        if(res.ok){
            this.allProducts = data;
        }else{
            this.error = data.message;
        }
    },
    watch:{
        allProducts: function(){
            if(this.allProducts){
                for(let products in this.allProducts){
                    let product = this.allProducts[products]
                    if(product.active){
                        this.allApprovals[product.id] = "Disapprove";
                        this.allApproved[product.id] = "btn btn-danger";
                        this.activate[product.id] = true;
                    }else{
                        this.allApprovals[product.id] = "Approve";
                        this.allApproved[product.id] = "btn btn-success";
                        this.activate[product.id] = false;
                    }
                }
            }
        },
    },
    methods: {
        async approve(product_id){
            const res = await fetch(`/activate/product/${product_id}`,{
                headers:{
                    'Authentication-Token': this.token
                },
                method: 'POST'
            });
            const data = await res.json()
            if(res.ok){
                this.allApproved[product_id] = "btn btn-danger";
                this.allApprovals[product_id] = "Disapprove";
                this.activate[product_id] = true;
            }else{
                this.error = data.message;
            }
            this.has_changed = !this.has_changed;
        },
        async disapprove(product_id){
            if(confirm("Deactivate Manager!\n"+ product_id)){
                const res = await fetch(`/deactivate/product/${product_id}`,{
                    headers:{
                        'Authentication-Token': this.token
                    },
                    method: 'POST'
                });
                const data = await res.json()
                if(res.ok){
                    this.allApproved[product_id] = "btn btn-success";
                    this.allApprovals[product_id] = "Approve";
                    this.activate[product_id] = false;
                }else{
                    this.error = data.message;
                }
                this.has_changed = !this.has_changed;
            }
        },
        async deactivateexp(){
            const res = await fetch('/deactivate-expired-products',{
                headers:{
                    'Authentication-Token': this.token
                },
                method: 'POST'
            });
            const data = await res.json();
            if(res.ok){
                const prod = await fetch('/products/manager',{
                    headers:{
                        'Authentication-Token': this.token,
                        'Content-type' : "application/json"
                    }
                });
                const newdata = await prod.json();
                if(prod.ok){
                    this.allProducts = newdata;
                }else{
                    this.error = data.message;
                }
            }else{
                this.error = data.message;
            }
        }
    }
}