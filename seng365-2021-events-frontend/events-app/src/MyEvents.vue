<template>
  <div id ="main">
    <Nav></Nav>
    <div v-if="errorFlag" style="color: #ff0000;">
      {{ error }}
    </div>
    <div id="events">
      <el-input placeholder="Search events" v-model="query">
        <template #append>
          <el-button icon="el-icon-search" v-on:click="getEvents()"></el-button>
        </template>
      </el-input>

      <el-table :data="events" style="width:100%" :default-sort = "{prop: 'date', order: 'descending'}">
        <el-table-column label="Event Image">
          <template #default="scope">
            <el-avatar shape="square" :size="50" :src="'http://localhost:4941/api/v1/events/' + events[scope.$index].eventId + '/image'"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="date" sortable label="Date and time">
        </el-table-column>
        <el-table-column prop="title" label="Event title">
        </el-table-column>
        <el-table-column prop="categories" label="Event category">
        </el-table-column>
        <el-table-column prop="organizerFirstName" label="First Name">
        </el-table-column>
        <el-table-column prop="organizerLastName" label="Last Name">
        </el-table-column>
        <el-table-column label="Host">
          <template #default="scope">
            <el-avatar shape="square" :size="50" class="hostImg" :src="'http://localhost:4941/api/v1/users/' + events[scope.$index].organizerId  + '/image'">
              <template #error>
                <i class="el-icon-picture-outline"></i>
              </template>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="numAcceptedAttendees" sortable label="Number of attendees">
        </el-table-column>
        <el-table-column label="Operations">
          <template #default="scope">
            <router-link :to="{name: 'event', params: {id: events[scope.$index].eventId}}">View event</router-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Nav from './Nav.vue';

//import axios from "axios";

export default {
  components: {
    Nav
  },
  data() {
    return{
      page: 1,
      count: 1,
      limit: 10,
      query: "",
      orgIds: [],
      lastPage: false,
      allCategories: [],
      categorysChosen: [],
      error: "",
      orgId: null,
      errorFlag: false,
      events: []
    }
  },
  mounted() {
    this.getEvents();
  },
  methods: {
    getEvents() {
      let params = {
        'organizerId': this.$getLoggedInUserId()
      };
      this.axios.get('http://localhost:4941/api/v1/events', {
        params: params
      }).then((response) => {
        this.events = response.data;
        for(let i = 0; i < this.events.length; i++){
          this.getOrganizerImage(i, this.events[i].eventId);
        }
      }).catch(err => alert(err));
    },
    getOrganizerImage(index, id){
      this.axios.get('http://localhost:4941/api/v1/events/' + id)
          .then((response) => {
            this.events[index]["organizerId"] = response.data.organizerId;
          });
    }
  },
}
</script>

<style>
#events {
  width: 80%;
  margin: 0px auto;
  background: #409EFF;
  border-radius: 10px;
  padding: 10px 10px 10px 10px;
}



.hostImg{
  height: 50px;
  width: 50px;
}

</style>