<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--搜索和添加-->
      <el-row :gutter="20">
        <el-col
          :span="8"
        >
          <el-input
            v-model="queryGood.query"
            placeholder="请输入商品名称"
            clearable
            @clear="getGoodsList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList()"
            />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="goGoodAddPage"
          >
            添加商品
          </el-button>
        </el-col>
      </el-row>
      <!--商品列表table-->
      <el-table
        :data="goodslist"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column
          type="index"
          label="序号"
          width="70px"
        />
        <el-table-column
          prop="goods_name"
          label="商品名称"
        />
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
          width="110px"
        />
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="100px"
        />
        <el-table-column
          prop="add_time"
          label="创建时间"
          width="180px"
        >
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180px"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="goGoodEditPage(scope.row.goods_id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoodsById(scope.row.goods_id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        :current-page="queryGood.pagenum"
        :page-sizes="[10, 20, 30]"
        :page-size="queryGood.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 从网络获取的商品列表
      goodslist: [],
      // 查询条件
      queryGood: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 从服务器获取商品列表
    getGoodsList () {
      this.$http
        .get('goods', { params: this.queryGood })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.goodslist = res.data.goods
          this.total = res.data.total
        })
        .catch((error) => error)
    },

    handleSizeChange (newpagesize) {
      this.queryGood.pagesize = newpagesize
      this.getGoodsList()
    },
    handleCurrentChange (newpagenum) {
      this.queryGood.pagenum = newpagenum
      this.getGoodsList()
    },
    goGoodEditPage (id) {
      this.$router.push({ name: 'goodsEdit', params: { 'goodsId': id }})
    },
    deleteGoodsById (id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http
            .delete('goods/' + id)
            .then(({ data: res }) => {
              if (res.meta.status !== 200) {
                return this.$message({
                  type: 'error',
                  message: res.meta.msg
                })
              }
              this.getGoodsList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            })
            .catch((error) => error)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    goGoodAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
