<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--步骤条-->
      <el-steps :active="activeIndex - 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
        label-position="top"
      >
        <!--tab标签-->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          style="height: 100%"
          :before-leave="beforeTabsLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="editForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="editForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="editForm.goods_cat"
                :options="catelist"
                :props="goodsCateProps"
                expand-trigger="hover"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              prop="goods_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item2"
                  v-for="(item2, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input
                placeholder="请输入内容"
                v-model="item.attr_vals"
                clearable
              >
              </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="picUploadURL"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="uploadSuccess"
              :headers="headerObj"
              :file-list="fileList"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器-->
            <quill-editor
              ref="quillEditor"
              v-model="editForm.goods_introduce"
            />
          </el-tab-pane>
          <el-button type="primary" @click="editGoods">编辑商品</el-button>
        </el-tabs>
      </el-form>
    </el-card>
    <!--预览图片对话框-->
    <el-dialog :visible.sync="picPreviewDialogVisible" width="50%">
      <img :src="picPreviewURL" class="pic_preview" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash";
export default {
  data() {
    return {
      goodsId: this.$route.params.goodsId,
      goodsInfo: {},
      //激活的标签索引
      activeIndex: "0",
      editForm: {
        id: this.$route.params.goodsId,
        goods_name: "",
        goods_cat: [],
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        goods_introduce: "",
        pics: [],
        attrs: [],
      },
      editFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      //商品分类
      catelist: [],
      goodsCateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      manyTableData: [],
      onlyTableData: [],
      //图片上传
      picUploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      headerObj: { Authorization: window.sessionStorage.getItem("token") },
      picPreviewDialogVisible: false,
      picPreviewURL: "",
      fileList: [],
    };
  },
  created() {
    this.getGoodsById();
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.editForm.goods_cat.length === 3) {
        return this.editForm.goods_cat[2];
      }
      return null;
    },
  },
  methods: {
    //根据id获取商品
    getGoodsById() {
      this.$http
        .get("goods/" + this.goodsId)
        .then(({ data: res }) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.goodsInfo = res.data;
          this.editForm.goods_name = this.goodsInfo.goods_name;
          let cate = [
            this.goodsInfo.cat_one_id,
            this.goodsInfo.cat_two_id,
            this.goodsInfo.cat_three_id,
          ];
          this.editForm.goods_cat = cate;
          this.editForm.goods_price = this.goodsInfo.goods_price;
          this.editForm.goods_number = this.goodsInfo.goods_number;
          this.editForm.goods_weight = this.goodsInfo.goods_weight;
          this.editForm.goods_introduce = this.goodsInfo.goods_introduce;
          this.editForm.attrs = this.goodsInfo.attrs;

          let tmpfilelist = [];
          this.goodsInfo.pics.forEach((item) => {
            tmpfilelist.push({
              tmp_path: item.pics_big,
              url: item.pics_big_url,
            });
            this.editForm.pics.push({ pic: item.pics_big });
          });
          this.fileList = tmpfilelist;
          console.log(this.fileList);
        })
        .catch((error) => error);
    },
    //获取商品分类列表
    getCateList() {
      this.$http
        .get("categories", { params: 3 })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message.error("获取商品分类列表失败");
          }
          this.catelist = res.data;
        })
        .catch((error) => error);
    },
    handleChange() {
      console.log(this.editForm.goods_cat);
      if (this.editForm.goods_cat.length != 3) {
        this.editForm.goods_cat = [];
        return;
      }
    },
    beforeTabsLeave(activeName, oldActiveName) {
      if (oldActiveName == 0 && this.editForm.goods_cat.length != 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    //获取参数分类属性列表
    getParamsCate(type) {
      this.$http
        .get(`categories/${this.cateId}/attributes`, {
          params: { sel: type },
        })
        .then(({ data: res }) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }

          if (type === "many") {
            res.data.forEach((item) => {
              item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            });

            this.manyTableData = res.data;
          } else {
            this.onlyTableData = res.data;
          }
        })
        .catch((error) => error);
    },
    //tab点击事件
    tabClick() {
      if (this.activeIndex === "1") {
        //商品参数
        this.getParamsCate("many");
      } else if (this.activeIndex === "2") {
        //商品属性
        this.getParamsCate("only");
      }
    },
    //图片上传
    uploadSuccess(response) {
      let tempObj = { pic: response.data.tmp_path };
      this.editForm.pics.push(tempObj);
      console.log(this.editForm);
    },
    //图片预览
    handlePictureCardPreview(file) {
      this.picPreviewURL = file.url;
      this.picPreviewDialogVisible = true;
    },
    //图片移除
    handleRemove(file) {
      //先找到要删除的图片在pic中的index，然后通过splice删除
      let tmpPath = file.tmp_path;
      let index = this.editForm.pics.findIndex((x) => {
        x.pics_big === tmpPath;
      });
      this.editForm.pics.splice(index, 1);
    },

    //修改商品
    editGoods() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) {
          return this.$message.error("请填写相关必填项！");
        }
        let copyForm = _.cloneDeep(this.editForm);
        copyForm.goods_cat = copyForm.goods_cat.join(",");
        let attrsPush = [];
        this.manyTableData.forEach((item) => {
          let attrsInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };

          attrsPush.push(attrsInfo);
        });
        this.onlyTableData.forEach((item) => {
          let attrsInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };

          attrsPush.push(attrsInfo);
        });
        copyForm.attrs = attrsPush;
        console.log(copyForm);
        //移除api中不需要的属性
        //_.omit(copyForm, ['goods_cat']);
        this.$http
          .put("goods/" + this.goodsId, copyForm)
          .then(({ data: res }) => {
            console.log(res);
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg);
            }
            this.$router.push("/goods");
          })
          .catch((error) => error);
      });
    },
  },
};
</script>
<style lang="less" scoped>
.el-tabs {
  margin-top: 15px;
  margin-bottom: 15px;
}
.el-form-item {
  margin-left: 15px;
}
.el-checkbox {
  margin: 2px 5px !important;
}
.pic_preview {
  width: 100%;
}
.el-button {
  margin-top: 15px;
}
</style>