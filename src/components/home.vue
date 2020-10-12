<template>
  <el-container class="home-container">
    <!--页面头部-->
    <el-header>
      <div>
        <img
          src="../assets/heima.png"
          alt=""
        />
        <span>电商管理系统</span>
      </div>
      <el-button
        type="info"
        @click="logout"
      >退出</el-button>
    </el-header>
    <el-container>
      <!--页面侧边栏部分-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div
          class="collapse-btn"
          @click="toggleClick"
        >|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!--一级菜单-->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menusList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="clickMenu('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--页面主体部分-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      //从网络获取的侧边栏列表
      menusList: [],
      //一级图标对象
      iconObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-platform-eleme',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data',
      },
      //是否折叠侧边栏
      isCollapse: false,
      //激活的侧边栏地址
      activePath: '',
    }
  },
  created() {
    this.getMenuList()
    //点击二级侧边栏的时候将激活的路径保存在sessionStorage中，
    //刷新页面的时候从sessionStorage中获取路径，以保证刷新后还是在刷新前的页面
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //点击退出主页
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //从服务器获取侧边栏数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200)
        return this.$message.error('获取左侧菜单列表失败')
      this.menusList = res.data
    },
    //点击折叠侧边栏
    toggleClick() {
      this.isCollapse = !this.isCollapse
    },
    //点击侧边栏
    clickMenu(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
  },
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  border-right: none; //选中后右边有1px的凸出部分，增加这个属性去除
}
.el-main {
  background-color: #eaedf1;
}
.collapse-btn {
  background-color: #4a5064;
  color: #fff;
  font-size: 10px;
  line-height: 30px; //line-height表示每行文字所占的高度,height表示一行的高度
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>