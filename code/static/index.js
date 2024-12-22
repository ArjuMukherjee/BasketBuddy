import router from './router.js'
import NavBar from './components/NavBar.js'


router.beforeEach((to, from, next) => {
    if (to.name !== 'Login' && to.name !== 'Register' && !localStorage.getItem('auth-token')? true:false) next({ name: 'Login' })
    else next()
})

new Vue({
    el: '#app',
    template: `<div>
    <NavBar :key='has_changed'/>
    <router-view/></div>
    `,
    router,
    components: {
        NavBar,
    },
    data: function(){
        return{
            has_changed: true
        }
    },
    watch: {
        $route(to,from){
            this.has_changed = !this.has_changed
        }
    }
})