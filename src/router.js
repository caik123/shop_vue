import Vue from 'vue'
import Router from 'vue-router'
// 删除下面import，按需导入
// import Login from './components/Login'
// import Home from './components/Home'
// import Welcome from './components/Welcome'
// import Users from './components/user/Users'
// import Right from './components/permission/Right.vue'
// import Roles from './components/permission/Roles.vue'
// import GoodClassify from './components/goods/GoodClassify.vue'
// import Params from './components/goods/Params.vue'
// import GoodList from './components/goods/List.vue'
// import GoodAdd from './components/goods/Add.vue'
// import GoodEdit from './components/goods/Edit.vue'
// import OrderList from './components/orders/List.vue'
// import Report from './components/report/Report.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: () => import('@/components/Login') },
    {
      path: '/home',
      component: () => import('@/components/Home'),
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: () => import('@/components/Welcome') },
        { path: '/users', component: () => import('@/components/user/Users') },
        { path: '/rights', component: () => import('@/components/permission/Right') },
        { path: '/roles', component: () => import('@/components/permission/Roles') },
        { path: '/categories', component: () => import('@/components/goods/GoodClassify') },
        { path: '/params', component: () => import('@/components/goods/Params') },
        { path: '/goods', component: () => import('@/components/goods/List') },
        { path: '/goods/add', component: () => import('@/components/goods/Add') },
        { path: '/goods/edit', name: 'goodsEdit', component: () => import('@/components/goods/Edit') },
        { path: '/orders', component: () => import('@/components/orders/List') },
        { path: '/reports', component: () => import('@/components/report/Report') }
      ]
    }
  ]
})

// 路由守卫
// 如果是login页面，直接放行，如果token为空，则强制路由到login页面，否则放行
router.beforeEach((to, from, next) => {
  if (to.path === '/login') { return next() }
  var token = window.sessionStorage.getItem('token')
  if (!token) { return next('/login') }
  next()
})
export default router
