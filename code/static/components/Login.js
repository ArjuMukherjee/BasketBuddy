export default{
    template: `
<div class='d-flex justify-content-center' style="margin-top: 25vh">
    <div class="mb-3 p-5 bg-light">
        <label for="Email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="Email" aria-describedby="emailHelp" v-model="cred.email">
        <label for="Password" class="form-label">Password</label>
        <input type="password" class="form-control" id="Password" v-model="cred.password">
        <div class="text-danger">{{error}}</div>
        <button type="submit" class="mt-3 btn btn-primary" @click='login'>Submit</button>&emsp;&emsp;&emsp;&emsp;&emsp;
        <a class="btn btn-link mt-3" href="/#/register" role="button">Sign Up</a>
    </div>
</div>
    `,
    data: function(){
        return {
            cred: {
                email: null,
                password: null,
            },
            error: null
        }
    },
    methods: {
        async login(){
            const res = await fetch('/user-login',{
                method: 'POST',
                headers: {
                    'Content-type' : "application/json",
                },
                body: JSON.stringify(this.cred)
            })
            const data = await res.json()
            if(res.ok){
                localStorage.setItem('auth-token',data.token)
                localStorage.setItem('role',data.role)
                this.$router.push({path:'/', query:{role:data.role}})
            }else{
                this.error = data.message
            }
        }
    }
}