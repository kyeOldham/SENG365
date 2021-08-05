<template>
  <div id="main-nav">
    <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        :default-active="$route.name"
        @select="menuSelect">
      <el-menu-item index="home">Home</el-menu-item>
      <el-menu-item v-if="!loggedIn" index="login">Login</el-menu-item>
      <el-menu-item v-if="!loggedIn" index="register">Register</el-menu-item>
      <el-menu-item v-if="loggedIn" index="createEvent">Create Event</el-menu-item>
      <el-menu-item v-if="loggedIn" index="myEvents">My Events</el-menu-item>
      <el-menu-item v-if="loggedIn" index="profile">Profile</el-menu-item>
      <el-menu-item v-if="loggedIn" @click="logout()">Logout</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
//import axios from "axios";

export default {
  data() {
    return {
      loggedIn: false,
      activeLink: null
    }
  },
  mounted() {
    this.activeLink = this.$route.path;
    this.loggedIn = this.$isLoggedIn();
  },
  methods: {
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    logout(){
        this.axios.post('http://localhost:4941/api/v1/users/logout', {},
            {
          headers: {
            'X-Authorization': this.$getLoggedInToken()
          }
        })
            .then(() => {
              this.$cookies.keys().forEach(cookie => this.$cookies.remove(cookie))
              this.$router.push('/');
            })
            .catch((error) => {
              if(error.response.status == 401){
                this.errorBox("You are not currently logged in");
              } else if(error.response.status == 500){
                this.errorBox("Internal Server Error!");
              }
            });
    },
    menuSelect(index) {
      if (this.$route.name !== index) {
        this.$router.push({
          name: index,
         });
      }
}
}
}
</script>

<style>

* {
  font-family: "Roboto",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

</style>
