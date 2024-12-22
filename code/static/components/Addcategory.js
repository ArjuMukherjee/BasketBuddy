export default{
    template:`
    <div class='d-flex justify-content-center' style="margin-top: 10vh" ref="addcategory">
        <div class="mb-3 p-5 bg-light">
            <label for="Name" class="form-label">Name</label>
            <input type="text" class="form-control" id="Name" v-model="category_name">
        </div>
    </div>
    `,
    data: function(){
        return {
            category_name: null,
            token: localStorage.getItem('auth-token'),
        }
    },
    methods: {
        async submit(){
            const res = await fetch('/api/categories',{
                method: 'POST',
                headers: {
                    'Authentication-Token': this.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'category_name':this.category_name})
            });
            const data = await res.json();
            if(res.ok){
                alert("Category added successfully!");
                this.$emit('catg_added',data);
            }else{
                alert(data.message);
            }
        }
    }
}