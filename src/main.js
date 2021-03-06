import Vue from 'vue'
import App from './App.vue'
import './assets/styles.sass'

Vue.prototype.$baseApi = "http://localhost:3000";

new Vue({
    el: '#app',
    render: h => h(App)
})