<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--表格-->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入搜索内容"
            clearable
            @clear="getOrdersList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrdersList()"
            />
          </el-input>
        </el-col>
      </el-row>

      <el-table
        :data="orderlist"
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
          label="订单编号"
          prop="order_number"
        />
        <el-table-column
          label="订单价格"
          prop="order_price"
        />
        <el-table-column
          label="是否付款"
          prop="pay_status"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.pay_status === '1'"
              type="success"
            >
              已付款
            </el-tag>
            <el-tag
              v-else
              type="danger"
            >
              未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
        />
        <el-table-column
          label="下单时间"
          prop="create_time"
          width="180px"
        >
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-tooltip
            class="item"
            effect="dark"
            content="修改订单地址"
            placement="top"
            :enterable="false"
          >
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog"
            />
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="查看物流信息"
            placement="top"
            :enterable="false"
          >
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressDialog"
            />
          </el-tooltip>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <!--修改订单地址对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeEditDialog"
    >
      <el-form
        ref="addressFormRef"
        :rules="addressFormRuls"
        :model="addressForm"
        label-width="100px"
      >
        <el-form-item
          label="省市区"
          prop="address1"
        >
          <el-cascader
            v-model="addressForm.address1"
            :options="addressData"
            :props="{ expandTrigger: 'hover' }"
          />
        </el-form-item>
        <el-form-item
          label="详细地址"
          prop="address2"
        >
          <el-input v-model="addressForm.address2" />
        </el-form-item>
      </el-form>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editDialogVisible = false"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!--物流进度对话框-->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import citydata from './citydata.js'
export default {
  data () {
    return {
      orderlist: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editDialogVisible: false,
      addressData: citydata,
      addressForm: {
        address1: '',
        address2: ''
      },
      addressFormRuls: {
        address1: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    getOrdersList () {
      this.$http
        .get('orders', { params: this.queryInfo })
        .then(({ data: res }) => {
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.orderlist = res.data.goods
          this.total = res.data.total
        })
        .catch((error) => error)
    },
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getOrdersList()
    },
    handleCurrentChange (newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getOrdersList()
    },
    showEditDialog () {
      this.editDialogVisible = true
    },
    closeEditDialog () {
      this.$refs.addressFormRef.resetFields()
    },
    showProgressDialog () {
      this.$http
        .get('/kuaidi/1106975712662')
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.progressInfo = res.data
        })
        .catch((error) => error)
      this.progressDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
