import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login'
import Home from './components/Home'
import Welcome from './components/Welcome'
import Users from './components/user/Users'
import Right from './components/permission/Right.vue'
import Roles from './components/permission/Roles.vue'
import GoodClassify from './components/goods/GoodClassify.vue'
import Params from './components/goods/Params.vue'
import GoodList from './components/goods/List.vue'
import GoodAdd from './components/goods/Add.vue'
import GoodEdit from './components/goods/Edit.vue'
import OrderList from './components/orders/List.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Right },
        { path: '/roles', component: Roles },
        { path: '/categories', component: GoodClassify },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodList },
        { path: '/goods/add', component: GoodAdd },
        { path: '/goods/edit', name: 'goodsEdit', component: GoodEdit },
        { path: '/orders', component: OrderList }
      ]
    }
  ]
})

//路由守卫
//如果是login页面，直接放行，如果token为空，则强制路由到login页面，否则放行
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  var token = window.sessionStorage.getItem("token");
  if (!token) return next('/login');
  next();
})
export default router