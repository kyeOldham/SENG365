<template>
  <div id ="main">
    <Nav></Nav>
      <div id="events">
        <el-input placeholder="Search events" v-model="query">
          <template #append>
            <el-button icon="el-icon-search" v-on:click="getEvents()"></el-button>
          </template>
        </el-input>

        <el-select v-model="categorysChosen" multiple placeholder="Categories">
          <el-option
              v-for="item in allCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>

        <el-table :data="paginatedEvents" style="width:100%" :default-sort = "{prop: 'date', order: 'descending'}">
          <el-table-column label="Event Image">
            <template #default="scope">
              <el-avatar shape="square" :size="50" :src="'http://localhost:4941/api/v1/events/' + paginatedEvents[scope.$index].eventId + '/image'" @error="errorHandler">
                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="date" sortable label="Date and time">
          </el-table-column>
          <el-table-column prop="title" label="Event title">
          </el-table-column>
          <el-table-column prop="categories" label="Event category">
          </el-table-column>
          <el-table-column prop="organizerFirstName " label="First Name">
          </el-table-column>
          <el-table-column prop="organizerLastName" label="Last Name">
          </el-table-column>
          <el-table-column label="Host">
            <template #default="scope">
                <el-avatar shape="square" :size="50" class="hostImg" :src="'http://localhost:4941/api/v1/users/' + events[scope.$index].organizerId  + '/image'" @error="errorHandler">
                <img src="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png" />
                </el-avatar>
            </template>
          </el-table-column>

          <el-table-column prop="numAcceptedAttendees" sortable label="Number of attendees">
          </el-table-column>
          <el-table-column label="Operations">
            <template #default="scope">
              <router-link :to="{name: 'event', params: {id: paginatedEvents[scope.$index].eventId}}">View event</router-link>
            </template>
          </el-table-column>
        </el-table>
        <el-row v-if="lastPage">
          <el-h1>No more events to display</el-h1>
        </el-row>
        <el-pagination layout="prev, pager, next" :total="count" :page-size="limit" v-model="page" @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </div>
</template>

<script>
import Nav from './Nav.vue';
import moment from 'moment';
export default {
  components: {
    Nav
  },
  data() {
    return{
      page: 1,
      maxPage: 1,
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
      events: [],
      paginatedEvents: [],
      initialResult: []
    }
  },
  mounted() {
    this.getEvents();
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
    errorHandler(){
      return true;
    },
    getEvents() {
      let params = {};
      if(this.query){
        params['q'] = this.query
      }
      if(this.categorysChosen.length >= 1){
        params['categoryIds'] = this.categorysChosen;
      }
      this.axios.get('http://localhost:4941/api/v1/events', {
        params: params,
        paramsSerializer: params => {
          return this.qs.stringify(params)
        }
      }).then((response) => {
            let today = new Date();
            let now = moment(today).format("YYYY-MM-DD HH:mm:ss");
            this.initialResult = response.data;
            for(let i = 0; i < this.initialResult.length; i++){
              let eventDate = moment(this.initialResult[i].date).format("YYYY-MM-DD HH:mm:ss");
              if(eventDate >= now){
                this.initialResult[i].date = eventDate;
                this.events.push(this.initialResult[i]);
              }
            }
            this.count = this.events.length;
            this.maxPage = Math.ceil(this.count / this.limit);

            this.paginatedEvents = this.events;
            this.paginate();
          for(let i = 0; i < this.events.length; i++){
            this.getOrganizerImage(i, this.events[i].eventId);
          }
          }).catch((error) => {
            if(error.response.status == 400){
              this.errorBox("Bad request!");
            } else if(error.response.status == 500){
              this.errorBox("Internal Server Error!");
            }
            });

    },
    getCategories() {
      this.axios.get('http://localhost:4941/api/v1/events/categories')
      .then((response) => {
        this.allCategories = response.data;
      }).catch(() => {
          this.errorBox("Internal Server Error!");
      });
    },
    handleCurrentChange(val){
      this.page = val;
      this.paginate();
    },
    paginate(){
      if(this.page == this.maxPage){
        this.lastPage = true;
      } else {
        this.lastPage = false;
      }
      this.paginatedEvents = this.events.slice((this.page - 1) * 10, this.page * 10);
    },
    getOrganizerImage(index, id){
        this.axios.get('http://localhost:4941/api/v1/events/' + id)
            .then((response) => {
                this.events[index]["organizerId"] = response.data.organizerId;
            }).catch((error) => {
          if(error.response.status == 404){
            this.errorBox("Organizer not found!");
          } else if(error.response.status == 500){
            this.errorBox("Internal Server Error!");
          }
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