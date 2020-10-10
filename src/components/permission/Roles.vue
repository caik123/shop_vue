<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary" @click="showAddUserRoleDialog()"
        >添加角色</el-button
      >
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['row-bm', i1 === 0 ? 'row-top' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'row-top', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!--渲染二级权限-->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--渲染三级权限-->
                  <el-col :span="13">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="70px"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoleDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoleById(scope.row.id)"
              >删除</el-button
            >

            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addUserRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClose()"
    >
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="addRoleForm.roleName"
            placeholder="请输入角色名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="addRoleForm.roleDesc"
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserRole()">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑角色对话框-->
    <el-dialog
      title="编辑角色"
      :visible.sync="editUserRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClose()"
    >
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="editRoleForm.roleName"
            placeholder="请输入角色名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="editRoleForm.roleDesc"
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserRole()">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="isShowRightDialog"
      width="50%"
      @close="setCloseRightDialog()"
    >
      <!--树形控件-->
      <el-tree
        ref="treeRef"
        :data="treeList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defCheckId"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="setRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      //控制添加角色对话框的显示和隐藏
      addUserRoleDialogVisible: false,
      //控制编辑角色对话框的显示和隐藏
      editUserRoleDialogVisible: false,
      //添加角色表单
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      //编辑角色表单
      editRoleForm: {
        roleId: 0,
        roleName: "",
        roleDesc: "",
      },
      //添加角色表单验证
      addRoleFormRules: {
        roleName: {
          required: true,
          message: "请输入角色名称",
          trigger: "blur",
        },
      },
      //编辑角色表单验证
      editRoleFormRules: {
        roleName: {
          required: true,
          message: "请输入角色名称",
          trigger: "blur",
        },
      },
      //控制分配权限对话框的显示和隐藏
      isShowRightDialog: false,
      //权限树形列表
      treeList: [],
      //树形控件属性
      treeProps: {
        children: "children",
        label: "authName",
      },
      //树形控件默认勾选的id列表
      defCheckId: [],
      //分配角色的id
      roleId: Number,
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    getRolesList() {
      this.$http
        .get("roles")
        .then(({ data: res }) => {
          if (res.meta.status != 200) {
            return this.$message.error(res.meta.msg);
          }
          this.rolesList = res.data;
        })
        .catch((error) => error);
    },
    //添加角色弹出dialog
    showAddUserRoleDialog() {
      this.addUserRoleDialogVisible = true;
    },
    //关闭添加角色dailog回调
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields();
    },
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields();
    },
    //添加角色
    addUserRole() {
      this.$refs.addRoleFormRef.validate((valid) => {
        if (!valid) return;
        this.$http
          .post("roles", this.addRoleForm)
          .then(({ data: res }) => {
            if (res.meta.status !== 201) {
              return this.$message.error("添加用户角色失败");
            }
            this.$message.success("添加用户角色成功");
            this.getRolesList();
            this.addUserRoleDialogVisible = false;
          })
          .catch((error) => error);
      });
    },
    //点击编辑按钮弹出编辑用户角色dialog
    editRoleDialog(role) {
      console.log(role);
      this.editRoleForm.roleName = role.roleName;
      this.editRoleForm.roleDesc = role.roleDesc;
      this.editRoleForm.id = role.id;

      this.editUserRoleDialogVisible = true;
    },
    //编辑用户提交到服务器
    editUserRole() {
      this.$refs.editRoleFormRef.validate((valid) => {
        if (!valid) return;
        this.$http
          .put("roles/" + this.editRoleForm.id, this.editRoleForm)
          .then(({ data: res }) => {
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg);
            }
            this.$message.success("编辑用户角色成功");
            this.getRolesList();
            this.editUserRoleDialogVisible = false;
          })
          .catch((error) => error);
      });
    },
    //删除用户角色
    deleteRoleById(id) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete("roles/" + id)
            .then(({ data: res }) => {
              console.log(res);
              if (res.meta.status != 200) {
                return this.$message.error("删除失败");
              }
              this.getRolesList();
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            })
            .catch((error) => error);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    /***
     * 删除角色的权限
     * @param role 角色
     * @param rightId 权限id
     */
    deleteRightById(role, rightId) {
      this.$confirm("此操作将永久删除该角色权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete("roles/" + role.id + "/rights/" + rightId)
            .then(({ data: res }) => {
              if (res.meta.status != 200) {
                return this.$message.error("删除角色权限失败");
              }
              role.children = res.data;
              this.$message.success("删除角色权限成功");
            })
            .catch((error) => error);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    //弹出设置权限对话框，并从后台获取所有权限列表
    showSetRightDialog(role) {
      this.roleId = role.id;
      this.$http
        .get("rights/tree")
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error("获取权限列表失败");
          }
          this.treeList = res.data;
        })
        .catch((error) => error);

      //获取叶子节点并将其赋值给defCheckId
      this.getLeafs(role, this.defCheckId);

      this.isShowRightDialog = true;
    },

    //获取某节点上所有叶子节点
    getLeafs(node, array) {
      if (!node.children) {
        return array.push(node.id);
      }
      node.children.forEach((element) => {
        this.getLeafs(element, array);
      });
    },

    //每次关闭对话框后重置defCheckId
    setCloseRightDialog() {
      this.defCheckId = [];
    },

    //给角色分配权限
    setRights() {
      let allowRight = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      let ids = allowRight.join(",");
      this.$http
        .post(`roles/${this.roleId}/rights`, { rids: ids })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error("分配角色权限失败");
          }
          this.getRolesList();
          this.$message.success("分配角色权限成功");
          this.isShowRightDialog = false;
        })
        .catch((error) => error);
    },
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.row-bm {
  border-bottom: 1px solid #eee;
}
.row-top {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>