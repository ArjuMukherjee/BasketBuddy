export default{
    template: `
<div :key="has_changed">
    <div class="h1 ms-3 mt-3 text-center">Users List</div>
    <div class="text-danger">{{error}}</div>
    <div class="h3 ms-3 mt-5 text-center">Not Approved</div>
    <div class="container mt-5">
        <div class="row" v-for="user in allUsers">
            <div class="col-8 text-center mt-2 me-nt-5" v-if="!activate[user.id]">{{user.email}}</div>
            <div class="col-4"><button type="button" v-bind:class="allApproved[user.id]" v-if="!activate[user.id]" @click="approve(user.id)" >{{allApprovals[user.id]}}</button></div>
        </div>
    </div>
    <div class="h3 ms-3 mt-5 text-center">Approved</div>
    <div class="container mt-5">
        <div class="row" v-for="user in allUsers">
            <div class="col-8 text-center mt-2 me-nt-5" v-if="activate[user.id]">{{user.email}}</div>
            <div class="col-4"><button type="button" v-bind:class="allApproved[user.id]" v-if="activate[user.id]" @click="disapprove(user.id)" >{{allApprovals[user.id]}}</button></div>
        </div>
    </div>
</div>
    `,
    data: function(){
        return {
            has_changed: true,
            allUsers: [],
            token: localStorage.getItem('auth-token'),
            error: null,
            allApprovals: {},
            allApproved: {},
            activate: {}
        }
    },
    async mounted(){
        const res = await fetch('/managers',{
            headers: {
                'Authentication-Token':this.token
            }
        });
        const data = await res.json().catch((e)=>{});
        if(res.ok){
            this.allUsers = data;
        }else{
            this.error = data.message;
        }
    },
    watch:{
        allUsers: function(){
            if(this.allUsers){
                for(let users in this.allUsers){
                    let user = this.allUsers[users]
                    if(user.active){
                        this.allApprovals[user.id] = "Disapprove";
                        this.allApproved[user.id] = "btn btn-danger";
                        this.activate[user.id] = true;
                    }else{
                        this.allApprovals[user.id] = "Approve";
                        this.allApproved[user.id] = "btn btn-success";
                        this.activate[user.id] = false;
                    }
                }
            }
        },
    },
    methods: {
        async approve(user_id){
            const res = await fetch(`/activate/manager/${user_id}`,{
                headers:{
                    'Authentication-Token': this.token
                },
                method: 'POST'
            });
            const data = await res.json()
            if(res.ok){
                this.allApproved[user_id] = "btn btn-danger";
                this.allApprovals[user_id] = "Disapprove";
                this.activate[user_id] = true;
            }else{
                this.error = data.message;
            }
            this.has_changed = !this.has_changed;
        },
        async disapprove(user_id){
            if(confirm("Deactivate Manager!\n"+ user_id)){
                const res = await fetch(`/deactivate/manager/${user_id}`,{
                    headers:{
                        'Authentication-Token': this.token
                    },
                    method: 'POST'
                });
                const data = await res.json()
                if(res.ok){
                    this.allApproved[user_id] = "btn btn-success";
                    this.allApprovals[user_id] = "Approve";
                    this.activate[user_id] = false;
                }else{
                    this.error = data.message;
                }
                this.has_changed = !this.has_changed;
            }
        }
    }
}