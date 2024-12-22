export default {
    template: `
    <div class='d-flex p-2 justify-content-center' style="margin-top: 5vh" :ref="category_name">
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
      </div>
    </div>
    `,
    props: ['category_name'],
    data: function () {
        return {
            product_details: {
                name: null,
                description: null,
                img_url: null,
                mfg_date: null,
                expiry_date: null,
                quantity: null,
                unit: null,
                price: null,
                category_name: this.category_name
            },
            token: localStorage.getItem('auth-token'),
            error: null
        }
    },
    methods: {
        async submit() {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Authentication-Token': this.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.product_details)
            });
            const data = await res.json();
            if (res.ok) {
                alert("Product added successfully!");
                this.$emit('prod_added',data);
            } else {
                alert(data.message);
            }
        }
    }
}