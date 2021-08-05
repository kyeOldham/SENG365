<template>
  <el-button @click="dialogVisible = true">Attendance Requests</el-button>
  <el-dialog title="Attendance Controls" v-model="dialogVisible">
    <el-table :data="attendees">
      <el-table-column prop="firstName" label="First name"></el-table-column>
      <el-table-column property="lastName" label="Last name"></el-table-column>
      <el-table-column property="dateOfInterest" label="Date interested"></el-table-column>
      <el-table-column property="status" label="Status"></el-table-column>
      <el-table-column label="Update status">
        <template #default="scope">
          <div v-if="checkStatus(attendees[scope.$index].status)">
            <el-button v-on:click="updateAttendeeStatus(attendees[scope.$index].attendeeId, 0)">Accept</el-button>
            <el-button v-on:click="updateAttendeeStatus(attendees[scope.$index].attendeeId, 2)">Reject</el-button>
          </div>
          <div v-else>
            Done
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      attendees: [],
      isAccepted: 'pending'
    }
  },
  props: ['event'],
  mounted() {
    this.getAttendees();
  },
  methods: {
      getAttendees(){
        this.axios.get('http://localhost:4941/api/v1/events/' + this.event.id + '/attendees', {
          headers: {
            'X-Authorization': this.$getLoggedInToken()
          }
        })
            .then((response) => {
              this.attendees = response.data;
            }).catch((error) => {
          if(error.response.status == 404){
            this.errorBox("Event does not exist!");
          } else if(error.response.status == 500){
            this.errorBox("Internal Server Error!");
          }
        });
    },
    updateAttendeeStatus(id, state){
        let newStatus = {}
        if(state == 0){
          newStatus['status'] = "accepted";
        } else {
          newStatus['status'] = "rejected";
        }
      this.axios.patch('http://localhost:4941/api/v1/events/' + this.event.id + '/attendees/' + id, newStatus, {
        headers: {
          'X-Authorization': this.$getLoggedInToken()
        }
      })
          .then(() => {
            this.getAttendees();
            this.$router.push('/events/' + this.event.id);
          }).catch((error) => {
        if(error.response.status == 404){
          this.errorBox("Attendee does not exist!");
        } else if(error.response.status == 401){
          this.errorBox("You must log in to update attendance!");
        } else if(error.response.status == 403){
          this.errorBox("You are not the organizer of this event");
        } else if(error.response.status == 500){
          this.errorBox("Internal Server Error!");
        }
      });
    },
    checkStatus(status) {
        if(status != 'pending'){
          return false
        } else {
          return true
        }
    }
  }
}
</script>