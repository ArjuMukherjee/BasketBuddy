import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Managers from './components/Managers.js'
import Categories from './components/Categories.js'
import buyproduct from './components/buyproduct.js'
import Cart from './components/Cart.js'
import Reviewproduct from './components/Reviewproduct.js'
import Products from './components/Products.js'
import summary from './components/summary.js'

const routes = [
    {path:'/',component: Home},
    {path:'/login',component:Login,name:'Login'},
    {path:'/register',component:Register,name:'Register'},
    {path:'/admin/managers',component:Managers,name:'Managers'},
    {path:'/admin/category',component:Categories,name:'Categories'},
    {path:'/buy/product/:id',component:buyproduct,props:true},
    {path:'/user/cart/',component:Cart},
    {path:'/review',component:Reviewproduct,name:'Reviewproduct'},
    {path:'/products/list',component:Products},
    {path:'/storesummary',component:summary}
]

export default new VueRouter({
    routes,
})