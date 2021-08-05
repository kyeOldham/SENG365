<template>
  <div id="user">
    <Nav></Nav>
    <el-row>
      <el-card class="box-card">
        <template #header>
          <div class="event-card-header">
            <el-image :src="'http://localhost:4941/api/v1/users/' + this.$getLoggedInUserId()+ '/image'" class="image">
              <template #error>
                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
              </template>
            </el-image>
            <div style="padding: 14px">
              <span style="margin-right: 10px;">{{ user.firstName }} {{ user.lastName }}</span>
              <EditUser @done="refreshUser" v-if="userLoaded" :user="user"></EditUser>
            </div>
          </div>
        </template>
        <div class="card-body" style="padding-left:0px">
          <span>{{user.email}}</span>
        </div>
      </el-card>
    </el-row>
  </div>
</template>

<script>
//import axios from "axios";
import EditUser from './EditUser.vue';
import Nav from './Nav.vue';
export default {
  components: {
    Nav, EditUser
  },
  data() {
    return{
      user: [],
      userId: null,
      userLoaded: false,
      error: "",
      errorFlag: false,
    }
  },
  mounted() {
    this.userId = this.$getLoggedInUserId();
    this.getUser(this.userId);
  },
  methods: {
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    getUser(userId) {
      //error checking for no eventId?
      this.axios.get('http://localhost:4941/api/v1/users/' + userId, {
        headers: {
          'X-Authorization': this.$getLoggedInToken()
        }
      })
          .then((response) => {
            this.user = response.data;
            this.userLoaded = true;
          }).catch((error) => {
        if(error.response.status == 400){
          this.errorBox("Can't find user!");
        } else if(error.response.status == 401){
          this.errorBox("Unauthorized!");
        } else if(error.response.status == 403){
          this.errorBox("Forbidden!");
        } else if(error.response.status == 500){
          this.errorBox("Internal Server Error!");
        }
      });
    },
    refreshUser(){
      this.getUser(this.userId);
      this.$router.go();
    },
    errorHandler(){
      return true;
    }
}
}
</script>

<style>
.box-card {
  width: 480px;
  text-align: left;
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

.el-card.is-always-shadow.box-card {
  margin: 0px auto;
  padding-top: 20px;
}

* {
  font-family: "Roboto",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

</style>
