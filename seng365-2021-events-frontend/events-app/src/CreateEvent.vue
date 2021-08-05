<template>
  <div id="newEvent">
    <Nav></Nav>
    <el-row>
      <el-card class="box-card">
        <template #header>
          <h2>Create an event</h2>
        </template>
        <div class="card-body" style="padding-left:0px">
          <el-form ref="eventForm" label="login" :model="eventForm" :rules="rules">
            <el-form-item label="Title" prop="title">
              <el-input placeholder="Title" v-model="eventForm.title"></el-input>
            </el-form-item>
            <el-form-item label="Category" prop="selectedCategorys">
              <el-select v-model="eventForm.selectedCategorys" multiple placeholder="Categories">
                <el-option
                    v-for="item in categories"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Date" prop="date">
              <el-date-picker
                  v-model="eventForm.date"
                  type="datetime"
                  placeholder="Select date and time">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Image" required>
              <el-upload class="image-uploader" :auto-upload="false" action="#"
                         :on-change="photoChanged"
                         :on-remove="handleRemove"
                         :on-preview="handlePictureCardPreview">
                <i class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
              <el-dialog :visible="dialogVisible">
                <img width="100%" :src="dialogImageUrl" alt="">
              </el-dialog>
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input placeholder="" v-model="eventForm.description"></el-input>
            </el-form-item>
            <el-form-item label="Max capacity" prop="capacity">
              <el-input placeholder="capacity" v-model="eventForm.capacity"></el-input>
            </el-form-item>
            <el-form-item label="Online or in person event">
              <el-switch
                  v-model="eventForm.isOnline"
                  active-text="Online"
                  inactive-text="In person"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
            <el-form-item label="URL" v-if="eventForm.isOnline" prop="url">
              <el-input placeholder="url" v-model="eventForm.url"></el-input>
            </el-form-item>
            <el-form-item label="Venue" v-else prop="venue">
              <el-input placeholder="venue" v-model="eventForm.venue"></el-input>
            </el-form-item>
            <el-form-item label="Requires attendance control?" prop="reqAttendanceControl">
              <el-switch
                  v-model="eventForm.reqAttendanceControl"
                  active-text="Yes"
                  inactive-text="No"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
            <el-form-item label="Fee" prop="fee">
              <el-input placeholder="fee" v-model="eventForm.fee"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('eventForm')">Create</el-button>
        </el-form-item>
      </el-card>
    </el-row>
  </div>
</template>

<script>
//import axios from "axios";
import moment from 'moment';
import Nav from './Nav.vue';
export default {
  components: {
    Nav
  },
  data() {
    var validDate = (rule, value, callback) => {
        let today = new Date();
        if(value < today){
          callback(new Error('Please enter a date in the future'));
        } else {
          callback();
        }
    };
    return {
      eventForm: {
        title: null,
        description: null,
        selectedCategorys: [],
        date: null,
        isOnline: true,
        url: null,
        venue: null,
        capacity: null,
        reqAttendanceControl: true,
        fee: null,
      },
      rules: {
        title: [{required: true, message:'Please enter a title', trigger: 'blur'}],
        description: [{required: true, message:'Please enter a description', trigger: 'blur'}],
        selectedCategorys: [{required: true, message:'Please choose a category', trigger: 'blur'}],
        date: [{validator: validDate, trigger: 'change'},
          {required: true, message:'Please enter a date', trigger: 'blur'}],
      },
      categories: [],
      image: null,
      errorFlag: false,
      event: {},
      dialogImageUrl: '',
      dialogVisible: false,
    }
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    onSubmit(form){
      this.$refs[form].validate((valid) => {
        if(valid){
          if(!this.image){
            this.errorBox("Image is required");
          } else {
            let newEvent = {
              'title': this.eventForm.title,
              'description': this.eventForm.description,
              'categoryIds': this.eventForm.selectedCategorys,
            };
            if(this.eventForm.date){
              let tempDate = moment(this.eventForm.date).format("YYYY-MM-DD HH:mm:ss");
              newEvent['date'] = tempDate;
            }
            if(this.isOnline){
              newEvent['isOnline'] = this.eventForm.isOnline;
            }
            if(this.eventForm.url){
              newEvent['url'] = this.eventForm.url;
            }
            if(this.eventForm.venue){
              newEvent['venue'] = this.eventForm.venue;
            }
            if(this.eventForm.capacity){
              newEvent['capacity'] = parseInt(this.eventForm.capacity, 10);
            }
            if(this.eventForm.reqAttendanceControl){
              newEvent['requiresAttendanceControl'] = this.eventForm.reqAttendanceControl;
            }
            if(this.eventForm.fee){
              newEvent['fee'] = parseInt(this.eventForm.fee, 10);
            }
            this.axios.post('http://localhost:4941/api/v1/events/', newEvent, {
              headers: {
                'X-Authorization': this.$getLoggedInToken()
              }
            })
                .then((response) => {
                  let eventId = response.data.eventId;
                  let imgType = this.image.type.toLowerCase();
                  if (imgType == 'image/jpeg' || imgType == 'image/jpg' || imgType == 'image/png'
                      || imgType == 'image/gif') {
                    this.axios.put('http://localhost:4941/api/v1/events/' + eventId + '/image', this.image, {
                      headers: {
                        'Content-Type': this.image.type,
                        'X-Authorization': this.$getLoggedInToken()
                      }
                    }).catch((error) => {
                      if(error.response.status == 404){
                        this.errorBox("Event does not exist!");
                      } else if(error.response.status == 401){
                        this.errorBox("You are not logged in");
                      } else if(error.response.status == 403){
                        this.errorBox("You are not the event organizer");
                      } else if(error.response.status == 500){
                        this.errorBox("Internal Server Error!");
                      } else if(error.response.status == 400){
                        this.errorBox("Bad image type");
                      }
                    });
                    this.$router.push('/myevents');
                  } else {
                    this.errorBox("Invalid image type");
                  }
                  //set image if they uploaded one
                }).catch((error) => {
              if(error.response.status == 400){
                this.errorBox("Fee or capacity must be a number!");
              } else if(error.response.status == 500){
                this.errorBox("Internal Server Error!");
              } else if(error.response.status == 401){
                this.errorBox("Unauthorized! Please log in");
              }
            });
          }

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
    getCategories(){
        this.axios.get('http://localhost:4941/api/v1/events/categories')
            .then((response) => {
              this.categories = response.data;
            }).catch(() => {
            this.errorBox("Internal Server Error!");
            });
    }
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
