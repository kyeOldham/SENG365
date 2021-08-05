<template>
  <div id="register">
    <Nav></Nav>
    <el-row>
      <el-card class="box-card">
        <template #header>
          <h2>Register</h2>
        </template>
        <div class="card-body" style="padding-left:0px">
          <el-form ref="regForm" label="login" :model="regForm" :rules="rules">
            <el-form-item label="First name" prop="firstName">
              <el-input placeholder="First name" v-model="regForm.firstName"></el-input>
            </el-form-item>
            <el-form-item label="Last name" prop="lastName">
              <el-input placeholder="Last name" v-model="regForm.lastName"></el-input>
            </el-form-item>
            <el-form-item label="Email" prop="email">
              <el-input placeholder="Email" v-model="regForm.email"></el-input>
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input placeholder="Password" v-model="regForm.password" show-password></el-input>
            </el-form-item>
            <el-form-item label="Avatar">
              <el-upload class="avatar-uploader" :auto-upload="false" action="#"
                         :on-change="photoChanged"
                         :on-remove="handleRemove"
                         :on-preview="handlePictureCardPreview">
                <i class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
              <el-dialog :visible="dialogVisible">
                <img width="100%" :src="dialogImageUrl" alt="">
              </el-dialog>
            </el-form-item>
          </el-form>
        </div>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('regForm')">Register</el-button>
        </el-form-item>
      </el-card>
    </el-row>
    <router-link :to="{ name: 'home' }">Back to Events</router-link>
  </div>
</template>

<script>
//import axios from "axios";
import Nav from './Nav.vue';
export default {
  components: {
    Nav
  },
  data() {
    var validEmail = (rule, value, callback) => {
      const regex = /@/g;
      if (!value.match(regex)) {
        callback(new Error('Please enter a valid email'));
      }
      callback();
    };
    return {
      regForm: {
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        image: null,
      },
      rules: {
        firstName: [{required: true, message:'Please input a first name', trigger: 'blur'}],
        lastName: [{required: true, message:'Please input a last name', trigger: 'blur'}],
        email: [{required: true, message:'Please enter an email', trigger: 'blur'},
                {validator: validEmail, trigger: 'blur'}],
        password: [{required: true, message:'Please enter a password', trigger: 'blur'},
          {min: 8, message: 'Password must be 8 characters long', trigger: 'blur' }],
      },
      event: {},
      dialogImageUrl: '',
      dialogVisible: false,
    }
  },
  mounted() {
    //this.getEvent();
  },
  methods: {
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    onSubmit(regForm){
      //check for errors
      this.$refs[regForm].validate((valid) => {
        if(valid){
          let newUser = {
            'firstName': this.regForm.firstName,
            'lastName': this.regForm.lastName,
            'email': this.regForm.email,
            'password': this.regForm.password
          };

          this.axios.post('http://localhost:4941/api/v1/users/register', newUser)
              .then((response) => {
                let id = response.data.userId;
                //log in as user
                this.axios.post('http://localhost:4941/api/v1/users/login', {
                  "email": this.regForm.email,
                  "password": this.regForm.password
                })
                    .then((response2) => {
                      this.$cookies.set('Token', response2.data.token, '2h');
                      this.$cookies.set('UserId', response2.data.userId, '2h');
                      if(this.image){
                        let imgType = this.image.type.toLowerCase();
                        if (imgType == 'image/jpeg' || imgType == 'image/jpg' || imgType == 'image/png'
                            || imgType == 'image/gif') {
                          this.axios.put('http://localhost:4941/api/v1/users/' + id + '/image', this.image, {
                            headers: {
                              'Content-Type': this.image.type,
                              'X-Authorization': this.$getLoggedInToken()
                            }
                          }).catch((error) => {
                            if(error.response.status == 404){
                              this.errorBox("User does not exist!");
                            } else if(error.response.status == 401){
                              this.errorBox("You are not logged in");
                            } else if(error.response.status == 403){
                              this.errorBox("You are not this user");
                            } else if(error.response.status == 500){
                              this.errorBox("Internal Server Error!");
                            } else if(error.response.status == 400){
                              this.errorBox("Bad image type");
                            }
                          });
                        } else {
                          this.errorBox("Invalid image type");
                        }
                      }
                      this.$router.push('/');
                      this.$forceUpdate();
                    }).catch((error) => {
                  if(error.response.status == 400){
                    this.errorBox("Invalid email or password!");
                  } else if(error.response.status == 500){
                    this.errorBox("Internal Server Error!");
                  }
                });
              }).catch((error) => {
            if(error.response.status == 400){
              this.errorBox("Email already in use!");
            } else if(error.response.status == 500){
              this.errorBox("Internal Server Error!");
            }
          });
        }
      });
    },
    handleRemove() {
      this.image = null; // remove photo from from when it's removed
    },
    photoChanged(file) {
      this.image = file.raw;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
  }
}
</script>

<style>
.box-card {
  width: 480px;
  text-align: left;
}


.el-card.is-always-shadow.box-card {
  margin: 0px auto;
  padding-top: 20px;
}

.image {
  width: 100%;
  display: block;
}
.event-card-header {
  justify-content: space-between;
  align-items: center;
  background-color: inherit!important;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
* {
  font-family: "Roboto",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

</style>
