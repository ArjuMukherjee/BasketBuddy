export default{
    template:`
    <div class='d-flex justify-content-center' style="margin-top: 10vh" ref="editcategory">
        <div class="mb-3 p-5 bg-light">
            <label for="Name" class="form-label">Name</label>
            <input type="text" class="form-control" id="Name" v-model="category_name">
        </div>
    </div>
    `,
    props: ['category','catg_id'],
    data: function(){
        return{
            category_name: this.category,
            token: localStorage.getItem('auth-token'),
            error: null
        }
    },
    watch:{
        category: function(){
            this.category_name = this.category;
        }
    },
    methods: {
        async submit(){
            console.log(this.category);
            const res = await fetch(`/api/categories/${this.catg_id}`,{
                method: 'PUT',
                headers:{
                    'Authentication-Token': this.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'category_name':this.category_name})
            });
            const data = await res.json();
            if(res.ok){
                this.$emit('catg_edit');
            }else{
                this.error = data.message;
            }
        }
    }
}