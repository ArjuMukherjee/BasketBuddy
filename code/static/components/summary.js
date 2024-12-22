export default{
    template:`
<div class="container-fluid" style="text-align: center; max-height:fit-content; max-width: fit-content;" :key="has_changed">
    <img src="/static/saleslastweek.jpg" alt="weeklygraph"/> <img src="/static/catgwiseprod.jpg" alt="totalitems"/>
    <div class="text-danger">{{error}}</div>
</div>
    `,
    data: function(){
        return {
            token: localStorage.getItem('auth-token'),
            error: null,
            has_changed: true
        }
    },
    async mounted(){
        const res = await fetch('/summary',{
            'Authentication-Token': this.token
        });
        const data = await res.json();
        if(!res.ok){
            this.error = data.message;
            this.has_changed = !this.has_changed;
        }
    }
}