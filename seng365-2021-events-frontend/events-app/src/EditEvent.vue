<template>
  <el-button @click="dialogFormVisible = true">Edit</el-button>
  <el-dialog title="Edit event" v-model="dialogFormVisible" :show-close="false"
             :close-on-press-escape="false" :close-on-click-modal="false">
    <el-form ref="form" :model="editedEvent" :rules="rules" label="Edit event">
      <el-form-item label="Title" prop="title">
        <el-input placeholder="Title" v-model="editedEvent.title"></el-input>
      </el-form-item>
      <el-form-item label="Category" prop="selectedCategorys">
        <el-select v-model="editedEvent.categories" multiple placeholder="Categories">
          <el-option
              v-for="item in allCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Date" prop="date">
        <el-date-picker
            v-model="editedEvent.date"
            type="datetime"
            placeholder="Select date and time">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="Image">
        <el-upload class="image-uploader" :auto-upload="false" action="#"
                   :on-change="photoChanged"
                   :on-remove="handleRemove"
                   :on-preview="handlePictureCardPreview">
          <i class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <el-img shape="square" :size="25" :src="'http://localhost:4941/api/v1/events/' + editedEvent.eventId + '/image'"></el-img>
        <el-dialog :visible="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input placeholder="" v-model="editedEvent.description"></el-input>
      </el-form-item>
      <el-form-item label="Max capacity" prop="capacity">
        <el-input placeholder="capacity" v-model="editedEvent.capacity"></el-input>
      </el-form-item>
      <el-form-item label="Online or in person event">
        <el-switch
            v-model="editedEvent.isOnline"
            active-text="Online"
            inactive-text="In person"
            active-color="#13ce66"
            inactive-color="#ff4949">
        </el-switch>
      </el-form-item>
      <el-form-item label="URL" v-if="editedEvent.isOnline" prop="url">
        <el-input placeholder="url" v-model="editedEvent.url"></el-input>
      </el-form-item>
      <el-form-item label="Venue" prop="venue" v-else>
        <el-input placeholder="venue" v-model="editedEvent.venue"></el-input>
      </el-form-item>
      <el-form-item label="Requires attendance control?">
        <el-switch
            v-model="editedEvent.reqAttendanceControl"
            active-text="Yes"
            inactive-text="No"
            active-color="#13ce66"
            inactive-color="#ff4949">
        </el-switch>
      </el-form-item>
      <el-form-item label="Fee" prop="fee">
        <el-input placeholder="fee" v-model="editedEvent.fee"></el-input>
      </el-form-item>

    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="closeDialog">Cancel</el-button>
      <el-button type="primary" @click="onSubmit('form')">Confirm</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script>
import moment from 'moment';

export default {
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
      editedEvent: {
        title: null,
        description: null,
        categories: [],
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
        categories: [{required: true, message:'Please choose a category', trigger: 'blur'}],
        date: [{validator: validDate, trigger: 'change'},
          {required: true, message:'Please enter a date', trigger: 'blur'}],
      },
      dialogFormVisible: false,
      dialogVisible: false,
      allCategories: [],
      errorFlag: false,
      image: null,
      dialogImageUrl: '',
    }
  },
  props: ['event'],
  methods: {
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    closeDialog(){
      this.$emit('done');
      this.dialogFormVisible = false
    },
    getCategories(){
      this.axios.get('http://localhost:4941/api/v1/events/categories')
          .then((response) => {
            this.allCategories = response.data;
          }).catch(() => {
        this.errorBox("Internal Server Error!");
      });
    },
    onSubmit(form){
      this.$refs[form].validate((valid) => {
            if(valid){
              //this.formValidate = true;
              let eventId = this.editedEvent.id;
              let newEvent = {
                'title': this.editedEvent.title,
                'description': this.editedEvent.description,
                'categoryIds': this.editedEvent.categories,
              };
              if(this.editedEvent.date){
                let tempDate = moment(this.editedEvent.date).format("YYYY-MM-DD HH:mm:ss");
                newEvent['date'] = tempDate;
              }
              if(this.editedEvent.isOnline){
                newEvent['isOnline'] = this.editedEvent.isOnline;
              }
              if(this.editedEvent.url){
                newEvent['url'] = this.editedEvent.url;
              }
              if(this.editedEvent.venue){
                newEvent['venue'] = this.editedEvent.venue;
              }
              if(this.editedEvent.capacity){
                newEvent['capacity'] = parseInt(this.editedEvent.capacity, 10);
              }
              if(this.editedEvent.reqAttendanceControl){
                newEvent['requiresAttendanceControl'] = this.editedEvent.reqAttendanceControl;
              }
              if(this.editedEvent.fee){
                newEvent['fee'] = parseInt(this.editedEvent.fee, 10);
              }
              this.axios.patch('http://localhost:4941/api/v1/events/' + eventId, newEvent, {
                headers: {
                  'X-Authorization': this.$getLoggedInToken()
                }
              })
                  .then(() => {
                    if(this.image){
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
                      } else {
                        this.errorBox("Invalid image type");
                      }
                    }
                    this.dialogFormVisible = false;
                    this.$emit('done');
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
                  this.errorBox("Invalid data in update");
                }
              });
            }
      })
      //check for errors

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
  },
  mounted(){
  this.getCategories();
  this.editedEvent = this.event;
}
}
</script>