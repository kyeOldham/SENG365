<template>
  <el-button @click="dialogFormVisible = true">Edit</el-button>
  <el-dialog title="Edit user" v-model="dialogFormVisible" :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
          <div style="text-align: center;" id="userStuff">
              <el-avatar shape="square" :size="50" class="hostImg" :src="'http://localhost:4941/api/v1/users/' + userId + '/image'">
                <template #error>
                  <i class="el-icon-picture-outline"></i>
                </template>
              </el-avatar>
              <h3>{{editedUser.firstName}} {{editedUser.lastName}}</h3>
          </div>
          <el-tabs :tab-position="top" style="height: auto;">
            <el-tab-pane label="General details">
              <el-form ref="genForm" :model="genForm" :rules="genFormRules" label="Update Details">
                <el-form-item label="First name" prop="firstName">
                  <el-input v-model="genForm.firstName"></el-input>
                </el-form-item>
                <el-form-item label="Last name" prop="lastName">
                  <el-input placeholder="Last name" v-model="genForm.lastName"></el-input>
                </el-form-item>
                <el-form-item label="Email" prop="email">
                  <el-input placeholder="Email" v-model="genForm.email"></el-input>
                </el-form-item>
              </el-form>
              <el-button type="primary" @click="onSubmitGen('genForm')">Confirm</el-button>
            </el-tab-pane>

            <el-tab-pane label="Image">
              <el-form ref="imageForm" :model="imageForm" label="Update Image">
                <div v-if="this.image">
                  <el-form-item label="Current Image" v-if="this.image">
<!--                    <el-avatar :src="'http://localhost:4941/api/v1/users/' + userId + '/image'"></el-avatar>-->
                    <el-avatar :src="this.image"></el-avatar>
                    <el-button @click="removeImage">Remove</el-button>
                  </el-form-item>
                </div>
                <el-form-item prop="image" label="Profile Photo">
                <el-upload class="avatar-uploader" :auto-upload="false" action="#"
                           :on-change="photoChanged"
                           :on-remove="handleRemove"
                           :on-preview="handlePictureCardPreview">
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <el-dialog :visible="imageForm.dialogVisible">
                  <img width="100%" :src="imageForm.dialogImageUrl" alt="">
                </el-dialog>
                  <el-button @click="updateImage">Update</el-button>
              </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="Password">
              <el-form ref="passwordForm" :model="passwordForm" :rules="passFormRules" label="Update Password">
              <el-form-item prop="currentPassword" label="Current Password">
                <el-input placeholder="Current Password" v-model="passwordForm.currentPassword" show-password></el-input>
              </el-form-item>
              <el-form-item prop="password" label="Password">
                <el-input placeholder="New Password" v-model="passwordForm.password" show-password></el-input>
              </el-form-item>
              </el-form>
              <el-button @click="updatePassword('passwordForm')">Change Password</el-button>
            </el-tab-pane>
          </el-tabs>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogFormVisible = false; this.$emit('done');">Cancel</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script>
//import axios from "axios";
export default {
  data() {
    var validEmail = (rule, value, callback) => {
      const regex = /@/g;
      if (!value.match(regex)) {
        callback(new Error('Please enter a valid email'));
      }
      callback();
    };
    return{
      userId: null,
      editedUser: [],
      image: null,
      genForm: {
        firstName: "",
        lastName: "",
        email: "",
      },
      imageForm: {
        image: null,
        dialogImageUrl: '',
        dialogVisible: false
      },
      genFormRules: {
        firstName: [{required: true, message:'Please input a first name', trigger: 'blur'}],
        lastName: [{required: true, message:'Please input a last name', trigger: 'blur'}],
        email: [{required: true, message:'Please enter an email', trigger: 'blur'},
          {validator: validEmail, trigger: 'blur'}],
      },
      passFormRules: {
        password: [{required: true, message:'Please input a new password', trigger: 'blur'},
          {min: 8, message: 'Password must be 8 characters long', trigger: 'blur' }],
        currentPassword: [{required: true, message:'Please enter your current password', trigger: 'blur'}]
      },
      passwordForm: {
        password: null,
        currentPassword: null
      },
      errorFlag: false,
      dialogFormVisible: false,
    }
  },
  props: ['user'],
  methods: {
    getUserImage (callback) {
      this.axios.get('http://localhost:4941/api/v1/users/' + this.userId + '/image', { responseType: 'blob' })
          .then((response) => {
            let reader = new FileReader();
            reader.readAsDataURL(response.data);
            reader.onload = () => {
              callback(reader.result);
            }
          })
          .catch((error) => {
            if(error.response.status == 404){
              this.errorBox("Image not found!");
            } else if(error.response.status == 500){
              this.errorBox("Internal Server Error!");
            }
          });
    },
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    successBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'success'
      })
    },
    onSubmitGen(form){
      this.$refs[form].validate((valid) => {
        if(valid){
        let editedUser = {
          'firstName': this.genForm.firstName,
          'lastName': this.genForm.lastName,
          'email': this.genForm.email,
        };
        this.axios.patch('http://localhost:4941/api/v1/users/' + this.userId, editedUser, {
          headers: {
            'X-Authorization': this.$getLoggedInToken()
          }
        })
            .then(() => {
              this.editedUser.firstName = this.genForm.firstName;
              this.editedUser.lastName = this.genForm.lastName;
              this.successBox('Updated user details');
              //log in as user
            })
            .catch((error) => {
              if(error.response.status == 400){
                this.errorBox("Email already in use!");
              } else if(error.response.status == 401){
                this.errorBox("Unauthorized!");
              } else if(error.response.status == 403){
                this.errorBox("Forbidden!");
              } else if(error.response.status == 500){
                this.errorBox("Internal Server Error!");
              }
            });
        }
      })
    },
    removeImage(){
      this.axios.delete('http://localhost:4941/api/v1/users/' + this.userId + '/image', {
        headers: {
          'X-Authorization': this.$getLoggedInToken()
        }
      })
          .then(() => {
            //this.imageForm.success = 'Removed Image';
            this.image = null;
            this.successBox('Deleted image!');
          })
          .catch((error) => {
            if(error.response.status == 401){
              this.errorBox("Unauthorized!");
            } else if(error.response.status == 403){
              this.errorBox("Forbidden!");
            } else if(error.response.status == 404){
              this.errorBox("Image not found!");
            } else if(error.response.status == 500){
              this.errorBox("Internal Server Error!");
            }
          });
    },
    updateImage(){
      let imgType = this.imageForm.image.type.toLowerCase();
      if (imgType == 'image/jpeg' || imgType == 'image/jpg' || imgType == 'image/png'
          || imgType == 'image/gif') {
        this.axios.put('http://localhost:4941/api/v1/users/' + this.userId + '/image', this.imageForm.image, {
          headers: {
            'Content-Type': this.imageForm.image.type,
            'X-Authorization': this.$getLoggedInToken()
          }
        })
            .then(() => {
              this.getUserImage( (image) => {
                this.image = image;
              })
              this.successBox('Updated image!');
            })
            .catch((error) => {
              if(error.response.status == 401){
                this.errorBox("Unauthorized!");
              } else if(error.response.status == 403){
                this.errorBox("Forbidden!");
              } else if(error.response.status == 404){
                this.errorBox("Image not found!");
              } else if(error.response.status == 400){
                this.errorBox("Bad request!");
              } else if(error.response.status == 500){
                this.errorBox("Internal Server Error!");
              }
            });
      } else {
          this.errorBox("Invalid image type");
      }
    },
    updatePassword(form){
      this.$refs[form].validate((valid) => {
        if(valid){
          let data = {
            'password': this.passwordForm.password,
            'currentPassword': this.passwordForm.currentPassword
          };
          this.axios.patch('http://localhost:4941/api/v1/users/' + this.userId, data, {
            headers: {
              'X-Authorization': this.$getLoggedInToken()
            }
          })
              .then(() => {
                this.successBox('Updated password!');
              })
              .catch((error) => {
                if(error.response.status == 400){
                  this.errorBox("Incorrect current password!");
                } else if(error.response.status == 401){
                  this.errorBox("Unauthorized!");
                } else if(error.response.status == 403){
                  this.errorBox("Forbidden!");
                } else if(error.response.status == 500){
                  this.errorBox("Internal Server Error!");
                }
              });
        }
      })
    },
    handleRemove() {
      this.imageForm.image = null; // remove photo from from when it's removed
    },
    photoChanged(file) {
      this.imageForm.image = file.raw;
    },
    handlePictureCardPreview(file) {
      this.imageForm.dialogImageUrl = file.url;
      this.imageForm.dialogVisible = true;
    },
  },
  mounted() {
    this.editedUser = this.user;
    console.log(this.user);
    this.userId = this.$getLoggedInUserId();
    this.genForm.firstName = this.editedUser.firstName;
    this.genForm.lastName = this.editedUser.lastName;
    this.genForm.email = this.editedUser.email;
    this.image = this.getUserImage((image) => {
      this.image = image;
    });
    //this.getUser();
  },
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
