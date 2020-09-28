<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        show-icon
        title="注意；只允许第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      >
      </el-alert>
      <el-row class="cate_row">
        <el-col>
          <span>商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs
        class="add_btn_cate"
        v-model="activeName"
        @tab-click="handleTabsClick"
      >
        <el-tab-pane label="动态参数" name="first">
          <el-button
            class="add_btn_cate"
            type="primary"
            :disabled="selectedKeys.length !== 3"
            @click="addDialogShow"
            >添加参数</el-button
          >
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(val, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handCloseTag(i, scope.row)"
                >
                  {{ val }}</el-tag
                >
                <!--New Tag标签-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="80px">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editDialogShow(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteCateById(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="second">
          <el-button
            class="add_cate"
            type="primary"
            :disabled="selectedKeys.length !== 3"
            @click="addDialogShow"
            >添加属性</el-button
          >
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(val, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handCloseTag(i, scope.row)"
                >
                  {{ val }}</el-tag
                >
                <!--New Tag标签-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="80px">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editDialogShow(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteCateById(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--增加参数/属性动态对话框-->
    <el-dialog
      :title="'添加' + dialogTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addFormClose"
    >
      <el-form
        ref="addFormRef"
        :rules="addFormRules"
        :model="addForm"
        label-width="100px"
      >
        <el-form-item :label="dialogTitle + '：'" prop="attr_name">
          <el-input
            v-model="addForm.attr_name"
            :placeholder="'请输入' + dialogTitle"
          ></el-input> </el-form-item
      ></el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑参数、属性动态对话框-->
    <el-dialog
      :title="'编辑' + dialogTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editFormClose"
    >
      <el-form
        ref="editFormRef"
        :rules="editFormRules"
        :model="editForm"
        label-width="100px"
      >
        <el-form-item :label="dialogTitle + '：'" prop="attr_name">
          <el-input
            v-model="editForm.attr_name"
            :placeholder="'请输入' + dialogTitle"
          ></el-input> </el-form-item
      ></el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      catelist: [],
      //父级分类的配置项
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      //选择的key值
      selectedKeys: [],
      //tabs
      activeName: "first",
      manyTableData: [],
      onlyTableData: [],
      //控制添加参数/属性的对话显示与隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: "",
      },
      editForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
      inputVisible: false,
      inputValue: "",
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类列表
    getCateList() {
      this.$http
        .get("categories")
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error("获取商品分类列表失败");
          }
          this.catelist = res.data;
        })
        .catch((error) => error);
    },
    //级联选择器选择事件
    handleChange() {
      if (this.selectedKeys.length != 3) {
        this.selectedKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }

      this.getParamsList();
    },
    //tabs
    handleTabsClick() {
      this.getParamsList();
    },
    //从网络获取参数列表
    getParamsList() {
      let sel = this.activeName === "first" ? "many" : "only";
      if (!this.selectedKeys[this.selectedKeys.length - 1]) {
        return;
      }
      this.$http
        .get(
          `categories/${
            this.selectedKeys[this.selectedKeys.length - 1]
          }/attributes`,
          { params: { sel } }
        )
        .then(({ data: res }) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("获取参数列表失败");
          }

          //将字符串attr_vals通过空格符分割成字符串
          res.data.forEach((element) => {
            element.attr_vals = element.attr_vals
              ? element.attr_vals.split(" ")
              : [];
            //为每行指定自己的inputVisible，不然点击一行，其他行也会跟着变
            element.inputVisible = false;
          });
          if (this.activeName === "first") {
            this.manyTableData = res.data;
          } else {
            this.onlyTableData = res.data;
          }
        })
        .catch((error) => error);
    },
    addDialogShow() {
      this.addDialogVisible = true;
    },
    addFormClose() {
      this.$refs.addFormRef.resetFields();
    },
    editFormClose() {
      this.$refs.editFormRef.resetFields();
    },
    editDialogShow(row) {
      this.editForm.id = row.cat_id;
      this.editForm.attrId = row.attr_id;
      this.editForm.attr_name = row.attr_name;
      this.editDialogVisible = true;
    },
    //提交表单
    addFormSubmit() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        this.$http
          .post(
            "categories/" +
              this.selectedKeys[this.selectedKeys.length - 1] +
              "/attributes",
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName === "first" ? "many" : "only",
            }
          )
          .then(({ data: res }) => {
            if (res.meta.status !== 201) {
              return this.$message.error(res.meta.msg);
            }
            this.$message.success("添加" + this.dialogTitle + "成功");
            this.getParamsList();
            this.addDialogVisible = false;
          })
          .catch((error) => error);
      });
    },
    //删除参数、属性
    deleteCateById(row) {
      this.$confirm(
        `此操作将永久删除该${this.dialogTitle}, 是否继续?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.$http
            .delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
            .then(({ data: res }) => {
              if (res.meta.status !== 200) {
                return this.$message.error("删除失败");
              }
              this.getParamsList();
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
    //修改表单
    editFormSubmit() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return;
        this.$http
          .put(
            "categories/" +
              this.selectedKeys[this.selectedKeys.length - 1] +
              "/attributes/" +
              this.editForm.attrId,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName === "first" ? "many" : "only",
            }
          )
          .then(({ data: res }) => {
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg);
            }

            this.getParamsList();
            this.editDialogVisible = false;
            this.$message.success("添加" + this.dialogTitle + "成功");
          })
          .catch((error) => error);
      });
    },
    //New Tag,当文本框失去鼠标焦点或者用户按下enter回车键的时候触发该方法
    handleInputConfirm(row) {
      if (this.inputValue.trim().length === 0) {
        row.inputVisible = false;
        return;
      }

      row.attr_vals.push(this.inputValue.trim());

      this.saveAttr(row);
    },

    //保存属性到服务器
    saveAttr(row) {
      this.$http
        .put(
          `categories/${
            this.selectedKeys[this.selectedKeys.length - 1]
          }/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: this.activeName === "first" ? "many" : "only",
            attr_vals: row.attr_vals.join(" "),
          }
        )
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.inputValue = "";
          row.inputVisible = false;
        })
        .catch((error) => error);
    },

    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    /**
     * @param i 删除的索引
     * @param row 删除的行
     */
    handCloseTag(i, row) {
      //splice会修改原数组
      row.attr_vals.splice(i, 1);
      this.saveAttr(row);
    },
  },

  computed: {
    //对话框的标题
    dialogTitle() {
      if (this.activeName === "first") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>
<style lang="less" scoped>
.cate_row {
  margin-top: 15px;
}
.add_btn_cate {
  margin-top: 5px;
}
.el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>