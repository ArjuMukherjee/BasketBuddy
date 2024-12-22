export default{
    template: `
    <div >
    <div class="fs-2 fw-semibold text-center mt-2" v-html="product_details.category_name"></div>
    <div class='d-flex p-2 justify-content-center' style="margin-top: 5vh">
      <div class="mb-3 p-5 bg-light">
        <label for="Name" class="form-label">Name</label>
        <input type="text" class="form-control" id="Name" v-model="product_details.name">
        <div class="mb-3">
          <label for="descr" class="form-label">Description</label>
          <textarea class="form-control" id="descr" rows="3" v-model="product_details.description" required></textarea>
        </div>
        <label for="img" class="form-label">Image URL</label>
        <input type="text" class="form-control" id="img" v-model="product_details.img_url">
        <label for="mfg" class="form-label">M.f.d</label>
        <input type="date" class="form-control" id="mfg" v-model="product_details.mfg_date">
        <label for="exp" class="form-label">E.x.p</label>
        <input type="date" class="form-control" id="exp" v-model="product_details.expiry_date">
        <label for="qnt" class="form-label">Quantity</label>
        <input type="number" class="form-control" id="qnt" v-model="product_details.quantity">
        <label for="unit" class="form-label">Unit</label>
        <input type="text" class="form-control" id="unit" v-model="product_details.unit">
        <label for="price" class="form-label">Price</label>
        <input type="number" class="form-control" id="price" v-model="product_details.price">
        <button type="button" class="mt-3 btn btn-primary" @click='save'>Save</button> <router-link type="button" class="mt-3 btn btn-danger" to='/'>Cancel</router-link>
      </div>
    </div>
    </div>
    `,
    data: function(){
        return {
            product_id: this.$route.params.product_id,
            product_details: {
                name: null,
                description: null,
                img_url: null,
                mfg_date: null,
                expiry_date: null,
                quantity: null,
                unit: null,
                price: null,
                category_name: this.$route.params.category
            },
            token: localStorage.getItem('auth-token'),
            error: null,
            has_changed: false
        }
    },
    async mounted(){
        const res = await fetch(`/product/details/${this.product_id}`,{
            headers:{
                'Authentication-Token': this.token,
            }
        });
        const data = await res.json();
        if(res.ok){
            this.product_details.name=data.name;
            this.product_details.description=data.description;
            this.product_details.img_url=data.img_url;
            this.product_details.mfg_date=data.mfg_date;
            this.product_details.expiry_date=data.expiry_date;
            this.product_details.quantity=data.quantity;
            this.product_details.unit=data.unit;
            this.product_details.price=data.price;
        }else{
            this.error = data.message;
        }
        this.has_changed = !this.has_changed;
    },
    methods:{
        async save(){
            const res = await fetch(`/api/products/${this.product_id}`,{
                method: 'PUT',
                headers:{
                    'Authentication-Token': this.token,
                    'Content-type' : "application/json"
                },
                body: JSON.stringify(this.product_details)
            });
            const data = await res.json();
            if(res.ok){
                alert("Product updated!");
                this.$router.push('/');
            }else{
                this.error = data.message;
            }
        }
    }
}