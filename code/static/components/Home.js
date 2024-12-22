import Addproduct from "./Addproduct.js";
import Addcategory from "./Addcategory.js";
import Editcategory from "./Editcategory.js";
export default {
  template: `
<div class="container-fluid" :key="has_changed">
  <div>
  <form class="d-flex mt-2" role="search">
  <input class="form-control me-2" type="search" :placeholder="search_item" v-model="search" aria-label="Search">
  <button class="nav-item dropdown btn btn-success">
    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
      {{search_item}}
    </a>
    <ul class="dropdown-menu">
      <li><a type="button" class="dropdown-item" @click="changesearchitem('Products')">Products</a></li>
      <li><a type="button" class="dropdown-item" @click="changesearchitem('Categories')">Categories</a></li>
    </ul>
  </button>
  </form>
    <span v-for="(catg,index) in filteredcatg">
      <h5 class="container-lg b" id="catid">{{index}}</h5>
      <div class="category container-lg jscat">
        <span v-for="(product,indx) in catg">
          <div class="items" >
          <router-link class="nav-link active" :to="'/buy/product/'+product.id" v-if="role == 'customer'">
            <b>
              <div style="translate: 0px 10px;">{{product.name}}</div>
              <br>
              <br>
              {{product.price}} rupees
              <br>
              <span v-if="product.quantity > 5">
                In Stock!
              </span>
              <span v-else-if="product.quantity > 0">
                Only {{product.quantity}} left!
              </span>
              <span v-else>
                Out of Stock!!
              </span>
            </b>
          </router-link>
          <div class="nav-link active" v-else>
            <b>
              <div style="translate: 0px 10px;">{{product.name}}</div>
              <br>
              <div style="translate: 0px -5px;" v-if="role == 'manager'">
                <button name="s_b_button" type="submit" value="Review" class="ttt"
                  style="background-color: blue;" @click="review(product.id,index)">Review</button>
                <button name="s_b_button" type="submit" value="Remove" class="ttt"
                  style="background-color: red;" @click="remove(product.id,indx,index)">Remove</button>
              </div>
              <br>
              {{product.price}} rupees
              <br>
              <span v-if="product.quantity > 5">
                In Stock!
              </span>
              <span v-else-if="product.quantity > 0">
                Only {{product.quantity}} left!
              </span>
              <span v-else>
                Out of Stock!!
              </span>
            </b>
          </div>
          </div>
        </span>
        <div class="items"
          style="vertical-align: center;padding-top: 42px;background-color: rgb(216, 209, 209);box-shadow: none;border-radius: 20px;" v-if="role == 'manager'">
          <button name="add" value="item" class="btn btn-primary btn-lg"
            style="border-radius: 100px;box-shadow: 1px 1px 5px black;" type="button" data-bs-toggle="modal" :data-bs-target="'#' + index">
            <h1><b>+</b></h1>
          </button>
        </div>
      </div>
      <br>
      <div class="container-lg c" style="text-align: right;">
        <div class="btn-group" role="group" aria-label="Basic example">
          <button type="submit" class="btn btn-dark" name="keys"
             @click="download(index)" v-if="role == 'manager'">Download</button>
          <button type="submit" class="btn btn-primary" style="background: blue; border: blue;" name="keys"
             data-bs-toggle="modal" :data-bs-target="'#edit' + catg_name_id[index]" v-if="role == 'admin'">Edit</button>
          <button type="submit" class="btn btn-primary" style="background: red; border: red;" name="keys"
             @click="removecatg(index)" v-if="role == 'admin'">Remove</button>
        </div>
      </div>
      <div class="container-lg d" style="translate: 0px 10px;">
        <hr style="border: 1px solid black;">
      </div>
      <div class="modal fade" :id="index" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">{{index}}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <Addproduct :category_name='index' :ref='index' @prod_added="recieveProd"/>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="$refs[index][0].submit()">Save</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" :id="'edit'+catg_name_id[index]" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5" id="staticBackdropLabel">{{index}}</h1>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <Editcategory ref="editcategory" @catg_edit="editCatg()" :category="index" :catg_id="catg_name_id[index]" :key="has_changed"/>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="$refs.editcategory[indexOf[index]].submit()">Save</button>
                </div>
              </div>
             </div>
          </div>
    </span>
    <br>
    <br>
    <div class="container-lg" style="text-align: right;" v-if="role != 'customer'">
      <button name="download" class="btn btn-dark btn-lg"
        style="border-radius: 15px;box-shadow: 1px 1px 5px blue;" type="button" @click="downloadstore" v-if="role == 'admin'">
        <h5>Download</h5>
      </button>&emsp;
      <button name="add" class="btn btn-primary btn-lg"
        style="border-radius: 15px;box-shadow: 1px 1px 5px blue;" type="button" data-bs-toggle="modal" data-bs-target="#categoryBackdrop">
        <h1><b>&emsp;+&emsp;</b></h1>
      </button>
    </div>
    <div class="modal fade" id="categoryBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">Name a Category</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <Addcategory ref="addcategory" @catg_added="recieveCatg"/>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="$refs.addcategory.submit()">Save</button>
            </div>
          </div>
        </div>
     </div>
    <br>
  </div>
</div>
    `,
  data: function () {
    return {
      categories: {},
      token: localStorage.getItem('auth-token'),
      error: null,
      role: localStorage.getItem('role'),
      has_changed: false,
      catg_name_id: {},
      indexOf: {},
      search: null,
      filteredcatg: null,
      search_item: "Products"
    }
  },
  async mounted() {
    this.fill();
  },
  watch:{
    categories: function(){
      let indexOf = {}
      let count = 0;
      for(const category in this.categories){
        indexOf[category] = count;
        count++;
      }
      this.indexOf = indexOf;
    },
    search: function(){
      if(this.search=="") this.filteredcatg = this.categories;
      else{
        if(this.search_item=='Categories'){
          let arr = {};
          let KEY = Object.keys(this.categories).filter((el)=>{
            return el.match(this.search);
          });
          for(let k in KEY){
            k = KEY[k];
            arr[k] = this.categories[k];
          }
          this.filteredcatg = arr;
        }else{
          let KEY = {};
          for(let category in this.categories){
            let catg = this.categories[category];
            for(let product in catg){
              product = catg[product];
              if(product.name.match(this.search)){
                if(category in KEY)
                  KEY[category].push(product);
                else KEY[category] = [product];
              }
            }
          }
          this.filteredcatg = KEY;
        }
      }
    }
  },
  methods: {
    async downloadstore(){
      const res = await fetch('/download/store-details',{
        headers:{
          'Authentication-Token': this.token
        }
      });
      const data = await res.json();
      if(res.ok){
        const taskId = data.taskId;
        const interval = setInterval(async ()=>{
          const csv_res = await fetch(`/get-store-details-csv/${taskId}`);
          if (csv_res.ok) {
            window.location.href = `/get-store-details-csv/${taskId}`;
            clearInterval(interval);
          }
        },100)
      }
    },
    async download(name){
      const res = await fetch(`/download/product-details/${this.catg_name_id[name]}`,{
        headers:{
          'Authentication-Token': this.token
        }
      });
      const data = await res.json();
      if(res.ok){
        const taskId = data.taskId;
        const intv = setInterval(async ()=>{
          const csv_res = await fetch(`/get-product-details-csv/${taskId}`);
          if (csv_res.ok) {
            window.location.href = `/get-product-details-csv/${taskId}`;
            clearInterval(intv);
          }
        },100)
      }
    },
    changesearchitem(name){
      this.search_item = name;
    },
    async fill(){
      const products = await fetch('/api/products', {
        headers: {
          'Authentication-Token': this.token
        }
      });
      const categories = await fetch('/api/categories', {
        headers: {
          'Authentication-Token': this.token
        }
      });
      const data1 = await products.json();
      const data2 = await categories.json();
      if (categories.ok && products.ok) {
        let mydic = {};
        for (const product in data1) {
          const name = data1[product].category.name
          if (name in mydic) mydic[name].push(data1[product])
          else mydic[name] = [data1[product]]
        }
        for (const category in data2) {
          if(!(data2[category].name in mydic) && this.role!='customer'){ mydic[data2[category].name] = [];}
          this.catg_name_id[data2[category].name] = data2[category].id;
        }
        this.categories = mydic;
        this.filteredcatg = mydic;
      } else {
        this.error = "*" + data1.message + "\n" + data2.message;
      }
    },
    async editCatg(){
      this.fill();
      this.has_changed = !this.has_changed;
    },
    review(id,catg_name){
      this.$router.push({name:'Reviewproduct',params:{product_id:id,category:catg_name}});
    },
    recieveProd(data){
      this.categories[data.category.name].push(data);
      this.has_changed = !this.has_changed;
    },
    recieveCatg(data){
      this.categories[data.name] = [];
      this.has_changed = !this.has_changed;
    },
    async remove(prod_id,indx,index){
      if(confirm(`Remove product ${prod_id}!`)){
        const res = await fetch(`/api/products/${prod_id}`,{
          method: 'DELETE',
          headers:{
            'Authentication-Token': this.token
          }
        });
        const data = await res.json();
        if(res.ok){
          if(this.categories[index].splice(indx,1))
            alert("Product Removed!");
          this.has_changed = !this.has_changed;
        }
      }
    },
    async removecatg(name){
      let id = this.catg_name_id[name];
      if(confirm(`Remove product ${id}!`)){
        const res = await fetch(`/api/categories/${id}`,{
          method: 'DELETE',
          headers:{
            'Authentication-Token': this.token
          }
        });
        const data = await res.json();
        if(res.ok){
          delete this.categories[name];
          alert(data.message);
          this.fill();
          this.has_changed = !this.has_changed;
        }
      }
    },
    filter(){
      
    }
  },
  components: {
    Addproduct,
    Addcategory,
    Editcategory
  }
}