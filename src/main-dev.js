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
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//富文本样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入页面顶部进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//配置网络baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//配置拦截，添加头部等
axios.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done();
  return config
})
//挂载
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI)

//引入树形插件
Vue.component("tree-table", ZkTable)
//引入富文本编辑器
Vue.use(VueQuillEditor)
/**
 * 时间过滤器
 * @param originVal 秒
 */
Vue.filter('dateFormat', function (originVal) {
  let dt = new Date(originVal * 1000)
  let year = dt.getFullYear()
  let month = (dt.getMonth() + 1 + '').padStart(2, '0')
  let day = (dt.getDate() + '').padStart(2, '0')
  let hour = (dt.getHours() + '').padStart(2, '0')
  let minute = (dt.getMinutes() + '').padStart(2, '0')
  let second = (dt.getSeconds() + '').padStart(2, '0')
  //return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`

})

new Vue({
  el: '#app',
  router,
  render: h => h(App),
}).$mount('#app')
