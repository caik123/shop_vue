<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片式布局-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="userParams.query"
            placeholder="请输入内容"
            clearable
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="addUserDialogVisible = true"
          >
            添加用户
          </el-button>
        </el-col>
      </el-row>
      <!--用户列表table-->
      <el-table
        :data="userlist"
        border
        stripe
      >
        <el-table-column
          type="index"
          label="序号"
          width="70px"
        />
        <el-table-column
          prop="username"
          label="姓名"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="mobile"
          label="电话"
        />
        <el-table-column
          prop="role_name"
          label="角色"
        />
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="onUserStateChange(scope.row)"
            />
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
              @click="editDialogShow(scope.row.id)"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
            />
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showUserRoleDialog(scope.row.id)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        :current-page="userParams.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      @close="dialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="70px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item
          label="手机"
          prop="mobile"
        >
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addUser()"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑用户对话框-->
    <el-dialog
      title="编辑用户"
      :visible.sync="editUserDialogVisible"
      width="50%"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="editForm.username"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        >
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editUser()"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <template>
        <div>
          <p>用户姓名：{{ userInfo.username }}</p>
          <p>用户角色：{{ userRole.roleName }}</p>
          <p>
            用户新角色：
            <el-select
              v-model="userRole.roleId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              />
            </el-select>
          </p>
        </div>
      </template>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="saveUserRole()"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 邮箱验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3|4|5|7|8][0-9]{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      // table列表数据
      userlist: [],
      // 查询参数
      userParams: {
        query: '',
        pagenum: 1, // 当前的页码
        pagesize: 2 // 每页的条目数
      },
      // 总页数
      total: 0,
      // 增加用户对话框显示和隐藏
      addUserDialogVisible: false,
      // 添加用户表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证规则
      addFormRules: {
        username: [{
          required: true,
          message: '请输入用户名称',
          trigger: 'blur'
        },
        {
          min: 3,
          max: 6,
          message: '长度在 3 到 6 个字符',
          trigger: 'blur'
        }
        ],
        password: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        },
        {
          min: 6,
          max: 15,
          message: '长度在 6 到 15 个字符',
          trigger: 'blur'
        }
        ],
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: 'blur'
        },
        {
          validator: checkEmail,
          trigger: 'blur'
        }
        ],
        mobile: [{
          required: true,
          message: '请输入手机号',
          trigger: 'blur'
        },
        {
          validator: checkMobile,
          trigger: 'blur'
        }
        ]
      },
      // 编辑用户对话框显示和隐藏
      editUserDialogVisible: false,
      // 编辑用户绑定数据
      editForm: {},
      // 编辑用户表单验证规则
      editFormRules: {
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: 'blur'
        },
        {
          validator: checkEmail,
          trigger: 'blur'
        }
        ],
        mobile: [{
          required: true,
          message: '请输入手机号',
          trigger: 'blur'
        },
        {
          validator: checkMobile,
          trigger: 'blur'
        }
        ]
      },
      // 分配角色对话框显示与否
      setRoleDialogVisible: false,
      // 用户信息
      userInfo: {},
      // 用户角色
      userRole: {},
      // 所有的角色列表
      roleList: []
    }
  },

  created () {
    this.getUserList()
  },

  methods: {
    // 获取用户列表
    async getUserList () {
      const {
        data: res
      } = await this.$http.get('users', {
        params: this.userParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // pagesize 改变时会触发，一页显示1行、5行、10行数据
    handleSizeChange (newPagesize) {
      this.userParams.pagesize = newPagesize
      this.getUserList()
    },
    // currentPage 改变时会触发，点击上、下一页或者具体第3页等
    handleCurrentChange (newPagenum) {
      this.userParams.pagenum = newPagenum
      this.getUserList()
    },
    // 修改用户状态
    async onUserStateChange (userInfo) {
      const {
        data: res
      } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      return this.$message.success('修改用户状态成功')
    },
    // 关闭对话框事件，清空form上的数据，不然下次点击进来上传输入的数据仍然存在
    dialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击对话框按钮，添加用户
    addUser () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const {
          data: res
        } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.getUserList()
        this.addUserDialogVisible = false
      })
    },
    // 点击按钮显示编辑对话框
    async editDialogShow (id) {
      const {
        data: res
      } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户数据失败')
      }

      this.editForm = res.data
      this.editUserDialogVisible = true
    },
    // 编辑用户
    editUser () {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const {
          data: res
        } = await this.$http.put(
          'users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('编辑用户失败')
          return
        }
        this.$message.success('编辑用户成功')
        this.editUserDialogVisible = false
        this.getUserList()
      })
    },
    // 根据id删除用户
    async deleteUserById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '删除用户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((error) => {
        return error
      })
      if (confirmResult === 'confirm') {
        const {
          data: res
        } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }

        this.$message.success('删除用户成功')

        // 解决最后一页只有一行数据，删除这条数据后页面异常
        const totalPage = Math.ceil((this.total - 1) / this.userParams.pagesize)
        const currentPage =
						this.userParams.pagenum > totalPage ?	 totalPage : this.userParams.pagenum
        this.userParams.pagenum = currentPage
        this.getUserList()
      } else {
        this.$message.info('用户取消了操作')
      }
    },

    /** *
			 * 显示分配角色对话框
			 * @param id 用户id
			 */
    showUserRoleDialog (id) {
      // 通过用户id获取用户信息
      this.$http
        .get('users/' + id)
        .then(({
          data: res
        }) => {
          if (res.meta.status !== 200) {
            return this.$message.error('获取用户信息失败')
          }
          this.userInfo = res.data
          // 通过角色id获取角色信息
          this.$http
            .get('roles/' + this.userInfo.rid)
            .then(({
              data: res
            }) => {
              if (res.meta.status !== 200) {
                return this.$message.error('获取用户角色失败')
              }
              this.userRole = res.data
            })
            .catch((error) => error)
        })
        .catch((error) => error)

      // 获取所有role列表
      this.$http
        .get('roles')
        .then(({
          data: res
        }) => {
          if (res.meta.status !== 200) {
            return this.$message.error('获取角色列表失败')
          }
          this.roleList = res.data
        })
        .catch((error) => error)

      this.setRoleDialogVisible = true
    },
    // 保存用户角色
    saveUserRole () {
      this.$http
        .put('users/' + this.userInfo.id + '/role', {
          rid: this.userRole.roleId
        })
        .then(({
          data: res
        }) => {
          if (res.meta.status !== 200) {
            return this.$message.error('分配角色失败')
          }
          this.$message.success('分配角色成功')
        })
        .catch((error) => error)

      this.setRoleDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped></style>
