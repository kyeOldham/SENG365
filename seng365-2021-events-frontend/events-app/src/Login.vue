<template>
  <div id="login">
    <Nav></Nav>
    <el-row>
      <el-card class="box-card">
        <template #header>
          <h2>Login</h2>
        </template>
        <div class="card-body" style="padding-left:0px">
          <el-form ref="form" label="login" :model="form" :rules="rules">
          <el-form-item id="email-input-wrapper" label="Email" prop="email">
              <el-input placeholder="Email" id="email-input" v-model="form.email"></el-input>
          </el-form-item>
          <el-form-item label="Password" id="password-input-wrapper" prop="password">
              <el-input placeholder="Password" id="password-input" v-model="form.password"></el-input>
          </el-form-item>
          </el-form>
        </div>
        <el-form-item>
          <el-button type="primary" @click="submitLogin('form')">Login</el-button>
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
    return{
      form: {
        email: null,
        password: null,
        error: null
      },
      rules: {
        email: [{required: true, message:'Please input an email', trigger: 'blur'}],
        password: [{required: true, message:'Please input a password', trigger: 'blur'}]
      },
      errorFlag: false,
      event: {},
    }
  },
  mounted() {
    this.checkLoggedIn();
  },
  methods: {
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    submitLogin(form) {
      this.$refs[form].validate((valid) => {
        if(valid) {
          this.axios.post('http://localhost:4941/api/v1/users/login', {
            "email": this.form.email,
            "password": this.form.password
          })
              .then((response) => {
                this.$cookies.set('Token', response.data.token, '2h');
                this.$cookies.set('UserId', response.data.userId, '2h');
                this.$router.push('/');
              })
              .catch((error) => {
                if(error.response.status == 400){
                  this.errorBox("Incorrect email or password");
                } else if(error.response.status == 500){
                  this.errorBox("Internal Server Error!");
                }
              });
        }
      });
    },
    checkLoggedIn() {
      if (this.$isLoggedIn()) {
        this.$router.push('/');
      }
    }
    },
  };
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
