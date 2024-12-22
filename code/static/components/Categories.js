export default{
    template:`
<div :key="has_changed">
    <div class="h1 ms-3 mt-3 text-center">Categories List</div>
    <div class="text-danger">{{error}}</div>
    <div class="h3 ms-3 mt-5 text-center">Not Approved</div>
    <div class="container mt-5">
        <div class="row" v-for="category in categories">
            <div class="col-4 text-center mt-2 me-nt-5" v-if="!activated[category.id]">{{category.creator}}</div>
            <div class="col-4 text-center mt-2 me-nt-5" v-if="!activated[category.id]">{{category.name}}</div>
            <div class="col-4"><button type="button" v-if="!activated[category.id]" v-bind:class="allApproved[category.id]" @click="approve(category.id)">{{allApprovals[category.id]}}</button></div>
        </div>
    </div>
    <div class="h3 ms-3 mt-5 text-center">Approved</div>
    <div class="container mt-5">
        <div class="row" v-for="category in categories">
            <div class="col-4 text-center mt-2 me-nt-5" v-if="activated[category.id]">{{category.creator}}</div>
            <div class="col-4 text-center mt-2 me-nt-5" v-if="activated[category.id]">{{category.name}}</div>
            <div class="col-4"><button type="button" v-if="activated[category.id]" v-bind:class="allApproved[category.id]" @click="disapprove(category.id)">{{allApprovals[category.id]}}</button></div>
        </div>
    </div>
</div>
    `,
    data: function(){
        return{
            categories: null,
            token: localStorage.getItem('auth-token'),
            error: null,
            allApprovals: {},
            allApproved: {},
            activated: {},
            has_changed: false
        }
    },
    async mounted(){
        const res = await fetch('/api/categories',{
            headers:{
                'Authentication-Token':this.token
            }
        });
        const data = await res.json()
        if(res.ok){
            this.categories = data;
        }else{
            this.error = data.message;
        }
    },
    watch:{
        categories: function(){
            if(this.categories){
                for(let category in this.categories){
                    category = this.categories[category];
                    if(category.active){
                        this.allApprovals[category.id] = "Disapprove";
                        this.allApproved[category.id] = "btn btn-danger";
                        this.activated[category.id] = true;
                    }else{
                        this.allApprovals[category.id] = "Approve";
                        this.allApproved[category.id] = "btn btn-success";
                        this.activated[category.id] = false;
                    }
                }
            }
        }
    },
    methods:{
        async approve(id){
            const res = await fetch(`/activate/category/${id}`,{
                method: 'POST',
                headers:{
                    'Authentication-Token': this.token
                }
            });
            const data = await res.json();
            if(res.ok){
                this.allApprovals[id] = "Disapprove";
                this.allApproved[id] = "btn btn-danger";
                this.activated[id] = true;
            }else{
                this.error = data.message;
            }
            this.has_changed = !this.has_changed;
        },
        async disapprove(id){
            if(confirm("Deactivate Category!\n"+id)){
                const res = await fetch(`/deactivate/category/${id}`,{
                    method: 'POST',
                    headers:{
                        'Authentication-Token': this.token
                    }
                });
                const data = await res.json();
                if(res.ok){
                    this.allApprovals[id] = "Approve";
                    this.allApproved[id] = "btn btn-success";
                    this.activated[id] = false;
                }else{
                    this.error = data.message;
                }
                this.has_changed = !this.has_changed;
            }
        }
    }
}