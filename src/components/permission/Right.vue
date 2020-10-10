<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightList" border stripe>
        <el-table-column type="index" label="序号" width="70px"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'"> 一级 </el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">
              二级
            </el-tag>
            <el-tag type="warning" v-else> 三级 </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightList: [],
    };
  },
  created() {
    this.$http
      .get("rights/list")
      .then(({ data: res }) => {
        console.log(res);
        if (!res.meta.status) {
          return this.$message.error(res.meta.msg);
        }
        this.rightList = res.data;
      })
      .catch((error) => {
        return error;
      });
  },
};
</script>
<style lang="less" scoped>
</style>