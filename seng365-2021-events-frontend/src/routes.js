import Search from './Search.vue';
import Home from './Home.vue';
const routes = [
     {path: '/', component: Home},
    {path: '/search', component: Search},
    // {path: '/register', component: Register},
    // {path: '/login', component: Login},
    // {path: '/user/:id', component: User, children: [
    //         {
    //             path: 'edit',
    //             name: 'editUser',
    //             component: editUser
    //         },
    //         // {
    //         //   path: 'events',
    //         //   name: 'viewEvents',
    //         //   component: userEvents
    //         // }
    //     ]},
    // //Edit event, accept or decline attendance requests, delete event
    // {path: '/event/:id', component: Event, children: [
    //         {
    //             path: 'edit',
    //             name: 'EditEvent',
    //             component: editEvent
    //         },
    //         {
    //             path: 'attendees',
    //             name: 'ManageAttendees',
    //             component: manageAttendance,
    //         }
    //
    //     ]},
    // {path: '/event', component: createEvent},

];

export default routes;