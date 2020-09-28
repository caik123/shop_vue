import Vue from 'vue'
import App from './App.vue'
import router from './router'
//导入全局样式
import './assets/css/global.css'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
//导入第三方树形插件
import ZkTable from 'vue-table-with-tree-grid'

//配置网络baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//配置拦截，添加头部等
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//挂载
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI)

//引入树形插件
Vue.component("tree-table", ZkTable)

new Vue({
  el: '#app',
  router,
  render: h => h(App),
}).$mount('#app')
