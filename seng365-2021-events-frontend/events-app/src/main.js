import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import App from './App.vue';
import Home from './Home.vue';
import Event from './Event.vue';
import Login from './Login.vue';
import Register from './Register.vue';
import CreateEvent from './CreateEvent.vue';
import MyEvents from './MyEvents.vue';
import User from './User.vue';
import axios from 'axios';


import qs from 'qs';
import moment from 'moment'

//import Session from './session';
import ElementPlus from 'element-plus'
import VueCookies from 'vue3-cookies'

const routes = [
    {path: '/', name: "home", component: Home},
    // {path: '/events', },
    {path: '/events/:id', name: "event", component: Event},
    {path: '/myevents', name: "myEvents", component: MyEvents},
    {path: '/events/create', name: "createEvent", component: CreateEvent},
    {path: '/login', name: "login", component: Login},
    {path: '/register', name: "register", component: Register},
    {path: '/profile', name: "profile", component: User}

];

const router = createRouter({
    routes,
    history: createWebHistory()
});


const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.use(VueCookies, {
    expireTimes: "2h",
    path: "/",
    domain: "",
    secure: true,
    sameSite: "None"
});
app.use(qs);


app.config.globalProperties.axios = axios;
app.config.globalProperties.moment = moment;
app.config.globalProperties.qs = qs;

app.config.globalProperties.$isLoggedIn = function () {
    if (app.config.globalProperties.$cookies.get('Token') !== null) return true;
    return false;
};

app.config.globalProperties.$getLoggedInToken = function () {
    return app.config.globalProperties.$cookies.get('Token');
};

app.config.globalProperties.$getLoggedInUserId = function () {
    return app.config.globalProperties.$cookies.get('UserId');
};

app.mount('#app');

