<template>
<div id="user">
  <Nav></Nav>
    <el-row>
      <div class="hero-image" :style="cssVars">
        <div class="hero-text">
          <h1>{{ event.title }}</h1>
          <time class="time">{{event.date}}</time>
        </div>
      </div>
<!--      <el-image :src="'http://localhost:4941/api/v1/events/' + event.id + '/image'" class="image">-->
<!--        <template #error>-->
<!--          <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>-->
<!--        </template>-->
<!--      </el-image>-->
    </el-row>
  <el-row style="margin: 0px auto; width: 90%;">
    <el-col :span="12" class="midCol">
      <el-row>
      <el-descriptions title="Event Details" direction="vertical" :column="4" border>
        <template #extra>
          <el-button v-if="!atCapacity && this.$isLoggedIn() && !alreadyAttending" @click="requestAttendance">Request Attendance</el-button>
          <el-button v-if="this.$isLoggedIn() && alreadyAttending" @click="revokeAttendance">Revoke Attendance</el-button>
          <EditEvent @done="refreshEvent" v-if="isOrganizer && futureEvent" :event="event"></EditEvent>
          <el-popconfirm v-if="isOrganizer && futureEvent"
                         title="Are you sure to delete this event?">
            <template #reference>
              <el-button @click="deleteEvent">Delete</el-button>
            </template>
          </el-popconfirm>
          <AttendanceControl v-if="isOrganizer" :event="event"></AttendanceControl>
        </template>
        <el-descriptions-item label="Title">{{ event.title }}</el-descriptions-item>
        <el-descriptions-item label="Time"><time class="time">{{event.date}}</time></el-descriptions-item>
        <el-descriptions-item label="Organizer" :span="2">
          <el-avatar shape="square" :size="100" :src="'http://localhost:4941/api/v1/users/' + event.organizerId + '/image'" @error="errorHandler">
          <img src="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png" />
          </el-avatar>
          {{event.organizerFirstName}} {{event.organizerLastName}}
        </el-descriptions-item>
        <el-descriptions-item label="Categories">
          {{event.categories}}
        </el-descriptions-item>
        <el-descriptions-item label="Description">
          {{event.description}}
        </el-descriptions-item>
        <el-descriptions-item v-if="event.capacity" label="Capacity">
          {{event.capacity}}
        </el-descriptions-item>
        <el-descriptions-item v-if="event.attendeeCount" label="Num Attendees">
          {{event.attendeeCount}}
        </el-descriptions-item>
        <el-descriptions-item v-if="event.url" label="URL">
          {{event.url}}
        </el-descriptions-item>
        <el-descriptions-item v-if="event.venue" label="Venue">
          {{event.venue}}
        </el-descriptions-item>
        <el-descriptions-item v-if="event.fee" label="Fee">
          {{event.fee}}
        </el-descriptions-item>
<!--        <el-descriptions-item label="Address">No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province</el-descriptions-item>-->
      </el-descriptions>
      </el-row>
    </el-col>
    <el-col :span="12" class="midCol">
      <el-row>
        <p style="font-size: 16px; font-weight: 700; margin: 0px; margin-bottom: 19px;">Attendees</p>
        <el-table :data="attendees" style="width:100%" :default-sort = "{prop: 'firstName', order: 'descending'}">
          <el-table-column label="Photo">
            <template #default="scope">
              <el-avatar shape="square" :size="50" class="hostImg" :src="'http://localhost:4941/api/v1/users/' + attendees[scope.$index].attendeeId  + '/image'" @error="errorHandler">
                <img src="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png" />
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="firstName" label="First Name">
          </el-table-column>
          <el-table-column prop="lastName" label="Last Name">
          </el-table-column>
          <el-table-column label="Role">
            <template #default="scope">
              <p v-if="attendees[scope.$index].attendeeId == event.organizerId">Organizer</p>
              <p v-else>Attendee</p>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-row>
        <el-col>
        <el-button v-on:click="toggleSimilar">Similar events</el-button>
        </el-col>
        <el-col>
        <div v-if="viewSimilar">
        <el-table :data="similarEvents" style="width:100%" :default-sort = "{prop: 'title', order: 'descending'}">
          <el-table-column prop="title" label="title">
          </el-table-column>
        </el-table>
        </div>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</div>
</template>

<script>
//import axios from "axios";
import EditEvent from './EditEvent.vue';
import AttendanceControl from './AttendanceControl.vue';
import Nav from './Nav.vue';
import moment from 'moment';
export default {
  components: {
    Nav, EditEvent, AttendanceControl
  },
  data() {
    return{
      eventId: null,
      attendees: [],
      alreadyAttending: null,
      atCapacity: null,
      isOrganizer: false,
      similarEvents: [],
      viewSimilar: false,
      futureEvent: null,
      error: "",
      errorFlag: false,
      event: {},
    }
  },
  computed: {
    cssVars() {
      return {
        '--imgSrc': `url('http://localhost:4941/api/v1/events/${this.event.id}/image')`,
    }
    }
  },
  mounted() {
    this.eventId = this.$route.params.id;
    this.getEvent();
    this.getSimilarEvents();
  },
  methods: {
    errorHandler(){
      return true;
    },
    refreshEvent(){
      this.getEvent();
      this.$router.go();
    },
    toggleSimilar(){
      if(this.viewSimilar){
        this.viewSimilar = false;
      } else {
        this.viewSimilar = true;
      }
    },
    errorBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'error'
      })
    },
    attendanceBox(message){
      this.$message({
        showClose: true,
        message: message,
        type: 'success'
      })
    },
    getEvent() {
      //error checking for no eventId?
      this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId)
          .then((response) => {
            this.event = response.data;
            if(this.event.organizerId == this.$getLoggedInUserId()){
              this.isOrganizer = true;
            }
            if(this.event.attendeeCount == this.event.capacity){
              this.atCapacity = true;
            } else {
              this.atCapacity = false;
            }
            let today = new Date();
            let now = moment(today).format("YYYY-MM-DD HH:mm:ss");
            let eventDate = moment(this.event.date).format("YYYY-MM-DD HH:mm:ss");
            if(eventDate < now){
              this.futureEvent = false;
            } else {
              this.futureEvent = true;
            }
            this.getAttendees();
          }).catch((error) => {
              if(error.response.status == 404){
                this.errorBox("Event does not exist!");
              } else if(error.response.status == 500){
                this.errorBox("Internal Server Error!");
              }
           });
    },
    getAttendees(){
      this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId + '/attendees')
          .then((response) => {
            this.attendees = response.data;
            this.alreadyAttending = false;
            for(let i = 0; i < this.attendees.length; i++){
              console.log(this.$getLoggedInUserId());
              console.log(this.attendees[i].attendeeId);
              if(this.attendees[i].attendeeId == this.$getLoggedInUserId()){
                this.alreadyAttending = true;
              }
            }
          }).catch((error) => {
              if(error.response.status == 404){
                this.errorBox("Event does not exist!");
              } else if(error.response.status == 500){
                this.errorBox("Internal Server Error!");
              }
          });
    },
    requestAttendance(){
      this.axios.post('http://localhost:4941/api/v1/events/' + this.eventId + '/attendees', {}, {
        headers: {
          'X-Authorization': this.$getLoggedInToken()
        }
      }).then(() => {
        this.attendanceBox("Attendance request submitted");
      }).catch((error) => {
        if(error.response.status == 404){
          this.errorBox("Event does not exist!");
        } else if(error.response.status == 401){
          this.errorBox("You must log in to request attendance!");
        } else if(error.response.status == 403){
          if(this.event.requiresAttendanceControl == true){
            this.errorBox("You are either already attending this event, or have " +
                "already submitted an attendance request!");
          } else {
            this.errorBox("Already attending event!");
          }

        } else if(error.response.status == 500){
          this.errorBox("Internal Server Error!");
        }
      });
    },
    revokeAttendance(){
      this.axios.delete('http://localhost:4941/api/v1/events/' + this.eventId + '/attendees', {
        headers: {
          'X-Authorization': this.$getLoggedInToken()
        }
      }).then(() => {
        this.attendanceBox('Attendance revoked');
      }).catch((error) => {
            if(error.response.status == 404){
              this.errorBox("Event does not exist!");
            } else if(error.response.status == 401){
              this.errorBox("You must log in to revoke attendance!");
            } else if(error.response.status == 403){
                this.errorBox("You are not attending this event");
            } else if(error.response.status == 500){
              this.errorBox("Internal Server Error!");
            }
      });
    },
    getSimilarEvents() {
      let params = {
        'categoryIds': this.event.categoryIds,
        'count': 5
      };
      this.axios.get('http://localhost:4941/api/v1/events', {
        params: params,
        paramsSerializer: params => {
          return this.qs.stringify(params)
        }
      }).then((response) => {
        this.similarEvents = response.data;
      }).catch((error) => {
        if(error.response.status == 400){
          this.errorBox("Bad request!");
        } else if(error.response.status == 500){
          this.errorBox("Internal Server Error!");
        }
      });
    },
    goToEvent(id){
      this.$router.push('/events/' + id);
    },
    deleteEvent(){
      this.axios.delete('http://localhost:4941/api/v1/events/' + this.event.id, {
        headers: {
          'X-Authorization': this.$getLoggedInToken()
        }
      })
          .then(() => {
            this.attendanceBox('Event deleted');
            this.$router.push('/');
          }).catch((error) => {
        if(error.response.status == 404){
          this.errorBox("Event does not exist!");
        } else if(error.response.status == 401){
          this.errorBox("You are not logged in");
        } else if(error.response.status == 403){
          this.errorBox("You are not the organizer of this event");
        } else if(error.response.status == 500){
          this.errorBox("Internal Server Error!");
        }
      });
    }
  }
}
</script>

<style>

.midCol {
  padding: 10px 10px;

}
.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
 th {
  border: 1px solid #EBEEF5;
  padding: 12px 10px;
}

.el-card.is-always-shadow.box-card {
  margin: 0px auto;
  padding-top: 20px;
}

.hero-image {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), var(--imgSrc);
  width: 90%;
  height: 200px;
  margin: 0px auto;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}

/* Place text in the middle of the image */
.hero-text {
  text-align: center;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

* {
  font-family: "Roboto",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

</style>
