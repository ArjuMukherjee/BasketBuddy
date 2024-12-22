export default{
    template: `
    <div class='d-flex justify-content-center' style="margin-top: 10vh">
    <div class="mb-3 p-5 bg-light">
        <label for="First_Name" class="form-label">First Name</label>
        <input type="text" class="form-control" id="First_Name" v-model="cred.first_name" required>
        <label for="Middle_Name" class="form-label">Middle Name</label>
        <input type="text" class="form-control" id="Middle_Name" v-model="cred.middle_name">
        <label for="Last_Name" class="form-label">Last Name</label>
        <input type="text" class="form-control" id="Last_Name" v-model="cred.last_name" required>
        <div class="mb-3">
        <label for="address" class="form-label">Address</label>
        <textarea class="form-control" id="address" rows="2" v-model="cred.address" required></textarea>
        </div>
        <label for="pin" class="form-label">Pin</label>
        <input type="number" class="form-control" id="pin" v-model="cred.pin" required>
        <label for="phno" class="form-label">Phone Number</label>
        <input type="text" class="form-control" id="phno" v-model="cred.phno" maxlength="10" minlength="10" required>
        <label for="username" class="form-label">Username</label>
        <input type="text" class="form-control" id="username" v-model="cred.username" required>
        <label for="Email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="Email" aria-describedby="emailHelp" v-model="cred.email" required>
        <label for="Password" class="form-label">Password</label>
        <input type="password" class="form-control" id="Password" v-model="cred.password" required>
        <label for="r_Password" class="form-label">Retype Password</label>
        <input type="password" class="form-control" id="r_Password" v-model="cred.r_password" required>
        <div class="text-danger">{{error}}</div>
        <link href="#">Sign In</link>
        <div class="form-check">
            <input class="form-check-input" type="radio" name="Role" id="Customer" value="customer" v-model="cred.role" checked>
            <label class="form-check-label" for="Customer">
                Customer
            </label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="radio" name="Role" id="Manager" value="manager" v-model="cred.role">
            <label class="form-check-label" for="Manager">
                Manager
            </label>
        </div>
        <button type="submit" class="mt-3 btn btn-primary" @click='register'>Submit</button>&emsp;&emsp;&emsp;&emsp;&emsp;
        <a class="btn btn-link mt-3" href="/#/login" role="button">Sign In</a>
    </div>
    </div>
    `,
    data: function(){
        return{
            cred: {
                first_name: null,
                middle_name:null,
                last_name: null,
                username: null,
                email: null,
                password: null,
                r_password: null,
                address: null,
                pin: null,
                phno:null,
                role: "customer"
            },
            error: null
        }
    },
    methods:{
        async register(){
            if(this.cred.password==this.cred.r_password){
                const res = await fetch('/user-register',{
                    method: 'POST',
                    headers: {
                        'Content-type' : "application/json",
                    },
                    body: JSON.stringify(this.cred)
                })
                const data = await res.json()
                if(res.ok){
                    this.$router.push({path:'/login'})
                }else{
                    this.error = "*"+data.message;
                }
            }else{
                this.cred.password = null;
                this.cred.r_password = null;
                this.error = "*please check the passwords!";
            }
        }
    }
}