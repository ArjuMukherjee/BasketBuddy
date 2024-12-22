export default{
    template: `
    <div>
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand fw-semibold" href="#">BasketBuddy</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                <router-link class="nav-link active" aria-current="page" to="/">Home</router-link>
                </li>
                <li class="nav-item" v-if="role == 'manager'">
                <router-link class="nav-link active" aria-current="page" to="/products/list">Products</router-link>
                </li>
                <li class="nav-item" v-if="role=='customer'">
                <router-link class="nav-link active" aria-current="page" to="/user/cart">Cart</router-link>
                </li>
                <li class="nav-item" v-if="role=='admin'">
                <router-link class="nav-link active" aria-current="page" to="/admin/managers">Managers</router-link>
                </li>
                <li class="nav-item" v-if="role=='admin'">
                <router-link class="nav-link active" aria-current="page" to="/admin/category">Category</router-link>
                </li>
                <li class="nav-item" v-if="role=='admin'">
                <router-link class="nav-link active" aria-current="page" to="/storesummary">Summary</router-link>
                </li>
                <li class="nav-item" v-if="is_logedin">
                <a class="nav-link" href="#" @click="logout">Logout</a>
                </li>
            </ul>
            </div>
        </div>
        </nav>
    </div>
    `,
    data: function(){
        return{
            is_logedin: localStorage.getItem('auth-token'),
            role: localStorage.getItem('role')
        }
    },
    methods: {
        async logout(){
            const res = await fetch('/log-out',{
                method: 'POST',
                headers:{
                    'Authentication-Token':localStorage.getItem('auth-token')
                }
            });
            const data = await res.json();
            if(res.ok){
                localStorage.removeItem('auth-token');
                localStorage.removeItem('role');
                this.$router.push({path: '/login'});
            }
        }
    }
}