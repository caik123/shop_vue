<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="setAddCateDialogVisiable()"
        >添加分类</el-button
      >
      <tree-table
        class="tree-table"
        :data="catelist"
        :columns="columns"
        :show-index="true"
        stripe
        border
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-check"
            style="color: green"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-close" style="color: red" v-else></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opration" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editDialogShow(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryCatelistParams.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryCatelistParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="closeAddCateDialog()"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cateProps"
            @change="cascaderHandleChange"
            clearable
            placeholder="请选择"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑对话框-->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="closeeditCateDialog()"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      catelist: [],
      queryCatelistParams: {
        type: [1, 2, 3],
        pagenum: 1,
        pagesize: 5,
      },
      total: 0, //商品总数
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          prop: "cat_level",
          type: "template",
          template: "sort",
        },
        {
          label: "操作",
          prop: "cat_deleted",
          type: "template",
          template: "opration",
        },
      ],

      //控制添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      addCateForm: {
        cat_pid: "",
        cat_name: "",
        cat_level: "",
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //编辑分类form
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: "",
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //编辑对象
      editCateModel: {},
      //父级分类列表
      parentCateList: [],
      //选择的key值
      selectedKeys: [],
      //父级分类的配置项
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类列表
    getCateList() {
      this.$http
        .get("categories", { params: this.queryCatelistParams })
        .then(({ data: res }) => {
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error("获取商品分类列表失败");
          }
          this.catelist = res.data.result;
          this.total = res.data.total;
        })
        .catch((error) => error);
    },
    //根据id删除分类
    deleteCateById(id) {
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete("categories/" + id)
            .then(({ data: res }) => {
              console.log(res);
              if (res.meta.status !== 200) {
                return this.$message.error("删除失败");
              }
              this.$message.success("删除成功");

              //解决最后一页只有一行数据，删除这条数据后页面异常
              let totalPage = Math.ceil(
                (this.total - 1) / this.queryCatelistParams.pagesize
              );
              let currentPage =
                this.queryCatelistParams.pagenum > totalPage
                  ? totalPage
                  : this.queryCatelistParams.pagenum;
              this.queryCatelistParams.pagenum = currentPage;

              this.getCateList();
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
    //pageSize 改变时会触发
    handleSizeChange(newPagesize) {
      this.queryCatelistParams.pagesize = newPagesize;
      this.getCateList();
    },
    //currentPage 改变时会触发
    handleCurrentChange(newPagenum) {
      this.queryCatelistParams.pagenum = newPagenum;
      this.getCateList();
    },
    //点击添加分类按钮，显示对话框
    setAddCateDialogVisiable() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取所有父级分类
    getParentCateList() {
      this.$http
        .get("categories", { params: { type: 2 } })
        .then(({ data: res }) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("获取商品分类列表失败");
          }
          this.parentCateList = res.data;
        })
        .catch((error) => error);
    },
    //点击级联选择器触发方法
    cascaderHandleChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    closeAddCateDialog() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    closeeditCateDialog() {
      this.$refs.editCateFormRef.resetFields();
      this.selectedKeys = [];
      this.editCateForm.cat_pid = 0;
      this.editCateForm.cat_level = 0;
    },
    //点击确定按钮，向服务器增加分类
    addCate() {
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) return;
        this.$http
          .post("categories", this.addCateForm)
          .then(({ data: res }) => {
            if (res.meta.status !== 201) {
              return this.$message.error("添加分类失败");
            }
            this.$message.success("添加分类成功");

            this.getCateList();
          })
          .catch((error) => error);

        this.addCateDialogVisible = false;
      });
    },
    /***
     * 弹出编辑对话框
     *@param cate 分类实体类
     */
    editDialogShow(cate) {
      this.editCateModel = cate;
      this.editCateForm.cat_name = cate.cat_name;
      this.editCateDialogVisible = true;
    },
    editCate() {
      this.$refs.editCateFormRef.validate((valid) => {
        if (!valid) return;
        this.$http
          .put("categories/" + this.editCateModel.cat_id, this.editCateForm)
          .then(({ data: res }) => {
            if (res.meta.status !== 200) {
              return this.$message.error("编辑失败");
            }
            this.getCateList();
            this.editCateDialogVisible = false;
            this.message.success("编辑成功");
          })
          .catch((error) => error);
      });
      this.editCateDialogVisible = false;
    },
  },
};
</script>
<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>