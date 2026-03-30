<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员ID" prop="userId">
            <Input type="text" v-model="searchForm.userId" placeholder="请输入会员ID" clearable style="width: 240px" />
          </Form-item>
          <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
        </Form>
      </Row>
    </Card>
    <Card>
      <Row class="operation padding-row" v-if="!selectedMember">
        <Button @click="addMember" type="primary">添加帖子</Button>
      </Row>

      <Table :loading="loading" :columns="columns" class="mt_10" :data="data" ref="table"></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
          @on-page-size-change="changePageSize" :page-size-opts="[20, 50, 100]" size="small" show-total show-elevator
          show-sizer></Page>
      </Row>
    </Card>

    <!-- 添加用户模态框 -->
    <Modal v-model="addFlag" title="添加帖子">
      <Form ref="addMemberForm" :model="addMemberForm" :rules="addRule" :label-width="100">
        <FormItem label="选择店铺" prop="storeName">
          <Input
            v-model="addMemberForm.storeName"
            readonly
          />
          <Button type="primary" :loading="submitLoading" @click="showSelector"
          >选择店铺</Button
          >
        </FormItem>
        <FormItem label="帖子内容" prop="content" style="width: 90%;">
          <editor
            ref="editor"
            openXss
            v-model="addMemberForm.content"
          ></editor>
        </FormItem>
        <FormItem label="图片" prop="images" style="width: 90%">
          <upload-pic-thumb v-model="addMemberForm.images" :isView="true"></upload-pic-thumb>
        </FormItem>
        <FormItem label="首页展示" prop="isHomeShow">
          <RadioGroup button-style="solid" v-model="addMemberForm.isHomeShow">
            <Radio :label="1">是</Radio>
            <Radio :label="0">否</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" @click="addMemberSubmit">确定</Button>
      </div>
    </Modal>
    <!-- 修改模态框 -->
    <Modal v-model="descFlag" :title="descTitle" width="500" @on-ok="editMemberSubmit">
      <Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">
        <FormItem label="选择店铺" prop="storeName">
          <Input
            v-model="form.storeName"
            readonly
          />
          <Button type="primary" :loading="submitLoading" @click="showSelector"
          >选择店铺</Button
          >
        </FormItem>
        <FormItem label="帖子内容" prop="content" style="width: 90%;">
          <editor
            ref="editor"
            openXss
            v-model="form.content"
          ></editor>
        </FormItem>
        <FormItem label="图片" prop="images" style="width: 90%">
          <upload-pic-thumb v-model="form.images" :isView="true"></upload-pic-thumb>
        </FormItem>
        <FormItem label="首页展示" prop="isHomeShow">
          <RadioGroup button-style="solid" v-model="form.isHomeShow">
            <Radio :label="1">是</Radio>
            <Radio :label="0">否</Radio>
          </RadioGroup>
        </FormItem>
        <div slot="footer">
          <Button @click="addFlag = false">取消</Button>
          <Button type="primary" @click="editMemberSubmit">确定</Button>
        </div>
      </Form>
    </Modal>
    <!-- 评论列表 -->
    <Modal v-model="commentFlag" :title="commentTitle" width="500">
      <div>
        <div class="comment-item" v-for="item in commentList" :key="item.id">
          <div>{{ item.createTime }}</div>
          <div class="comment-item-content">
            <div>{{ item.createBy }}: <span>{{ item.content }}</span></div>
            <span class="comment-item-delete" @click="deleteComment(item)">删除</span>
          </div>
        </div>
      </div>
    </Modal>
    <Modal
      @on-ok="confirmShop"
      @on-cancel="
        () => {
          this.showShopSelect = false;
        }
      "
      v-model="showShopSelect"
      width="80%"
    >
      <shopTemplate
        ref="shopRef"
        :checked="true"
        :selectedList="selectShopList"
        getType="CIRCLE"
        promotionStatus="START"
        @selected="selectedShop"
      />
    </Modal>
  </div>
</template>

<script>
import multipleMap from "@/components/map/multiple-map";
import * as API_Circle from "@/api/circle.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from "@/libs/RegExp.js";
import uploadPicThumb from "@/components/lili/upload-pic-thumb";
import editor from "@/components/editor/index.vue";
import shopTemplate from "@/views/seller/shop/shopList";

export default {
  name: "circle",
  components: {
    editor,
    multipleMap,
    ossManage,
    uploadPicThumb,
    shopTemplate,
  },
  data() {
    return {
      submitLoading: false, // 添加或编辑提交状态
      showShopSelect: false, //显示店铺选择框
      selectShopList: {}, //选择的店铺列表
      descTitle: "", // modal标题
      descFlag: false, //编辑查看框
      loading: true, // 表单加载状态
      addFlag: false, // modal显隐控制

      addMemberForm: {
        storeId: "",
        storeName: "",
        content: "",
        images: [],
        isHomeShow: 0,
      },
      searchForm: {
        // 请求参数
        pageNumber: 1,
        pageSize: 20, // 页面大小
        order: "desc",
        id: "",
        username: "",
        mobile: "",
      },
      form: {},
      walletIncreaseRule: {
        rechargeMoney: [
          { required: true, type: "number", message: "请输入充值金额", trigger: "change" },
          {
            validator: (rule, value, callback) => {
              if (typeof value !== "number" || value <= 0) {
                callback(new Error("充值金额必须大于0"));
                return;
              }
              callback();
            },
            trigger: "change",
          },
        ],
      },
      commentFlag: false,
      commentTitle: "",
      commentList: [],

      addRule: {
        // 验证规则
        storeName: [
          { required: true, message: "请选择店铺" }
        ],
        content: [
          { required: true, message: "请输入帖子内容" },
        ],
        images: [{ required: true, message: "请上传图片" }],
      },
      ruleValidate: {}, //修改验证
      columns: [
        {
          title: "会员ID",
          key: "userId",
          tooltip: true,
        },
        {
          title: "来源",
          key: "userType",
          align: "center",
          render: (h, params) => {
            const type = params.row.userType;
            const text = type === "MANAGER" ? "管理端" : "店铺端";

            return h("span", text);
          }
        },
        {
          title: "店铺名称",
          key: "storeName",
        },
        {
          title: "首页显示",
          key: "isHomeShow",
          align: "center",
          render: (h, params) => {
            const isHomeShow = params.row.isHomeShow;
            const text = isHomeShow === 1 ? "是" : "否";

            return h("span", text);
          }
        },
        {
          title: "图片",
          key: "images",
          align: "center",
          render: (h, params) => {
            const images = params.row.images;
            let imgSrc = "";
            if (Array.isArray(images) && images.length > 0) {
              const first = images[0];
              imgSrc = typeof first === "string" ? first : (first && first.url) || "";
            } else if (typeof images === "string") {
              imgSrc = images;
            }

            return h("img", {
              attrs: {
                src: imgSrc || require('@/assets/emptyImg.png'),
                alt: ""
              },
              style: {
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                objectFit: "cover"
              }
            });
          }
        },
        {
          title: "帖子内容",
          key: "content",
        },
        {
          title: "发布时间",
          key: "createTime",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", { class: "ops" }, [
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.seeComment(params.row);
                    },
                  },
                },
                "查看评论"
              ),
              h(
                "span",
                {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2",
                  },
                },
                "|"
              ),
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    },
                  },
                },
                "修改"
              ),
              h(
                "span",
                {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2",
                  },
                },
                "|"
              ),
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      selectMember: [], //保存选中的用户
    };
  },
  props: {
    // 是否为选中模式
    selectedMember: {
      type: Boolean,
      default: false,
    },
    // 已选择用户数据
    selectedList: {
      type: null,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    selectedList: {
      handler(val) {
        this.$set(this, "selectMember", JSON.parse(JSON.stringify(val)));
        this.init(this.data);
        // 将父级数据与当前组件数据进行匹配
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    //显示店铺选择框
    showSelector() {
      this.showShopSelect = true;
    },
    confirmShop() {
      // 调用子组件的确认选择方法
      this.$refs.shopRef.confirmSelect();
      // 关闭弹窗
      this.showShopSelect = false;
    },
    /**
     * 返回店铺
     */
    selectedShop(val) {
      console.log('返回店铺=', val)
      this.selectShopList = val;
      this.addMemberForm.storeId = val.id
      this.addMemberForm.storeName = val.storeName
      this.form.storeId = val.id
      this.form.storeName = val.storeName
    },
    // 回调给父级
    callback(val, index) {
      this.selectMember.forEach(item => { item.___selected = false })
      this.$set(val, "___selected", !val.___selected);
      let findUser = this.selectMember.find((item) => {
        return item.id == val.id;
      });
      // 如果没有则添加
      if (!findUser) {
        this.selectMember.push(val);
      } else {
        // 有重复数据就删除
        this.selectMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectMember.splice(index, 1);
          }
        });
      }

      this.$emit("callback", val);
    },
    // 初始化信息
    init(data) {
      data.forEach((item) => {
        if (this.selectMember.length != 0) {
          this.selectMember.forEach((member) => {
            if (member.id == item.id) {
              this.$set(item, "___selected", true);
            }
          });
        } else {
          this.$set(item, "___selected", false);
        }
      });
      this.data = data;
    },

    edit(v) {
      this.descTitle = `修改帖子`;
      this.descFlag = true;
      v.images = v.images||[]
      this.form = v;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该帖子?",
        loading: true,
        onOk: () => {
          API_Circle.delPost(v.id).then((res) => {
            this.$Modal.remove();
            this.$Message.success("删除成功");
            this.getData();
          });
        },
      });
    },

    deleteComment(v) {
      API_Circle.delComment(v.id).then((res) => {
        this.$Message.success("删除成功");
        this.commentList = this.commentList.filter(item => item.id !== v.id);
      });
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getData();
    },
    //查看详情修改
    editPerm(val) {
      this.descTitle = `查看用户 ${val.username}`;
      this.descFlag = true;
      this.getMemberInfo(val.id);
    },
    addMember() {
      this.addFlag = true;
      this.$refs.addMemberForm.resetFields();
    },
    /**
     * 查询查看会员详情
     */
    getMemberInfo(id) {
      API_Member.getMemberInfoData(id).then((res) => {
        if (res.result) {
          this.$set(this, "form", res.result);
        }
      });
    },

    //查询会员列表
    getData() {
      API_Circle.getPostList(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          const processedRecords = res.result.records.map(item => {
            let imagesArray = [];
            if (typeof item.images === 'string' && item.images.trim() !== '') {
              try {
                imagesArray = JSON.parse(item.images);
                // 確保是陣列
                if (!Array.isArray(imagesArray)) {
                  imagesArray = [];
                }
              } catch (e) {
                console.warn(`圖片JSON解析失敗 (id: ${item.id}):`, item.images, e);
                imagesArray = [];
              }
            }

            return {
              ...item,
              images: imagesArray   // 替換成真正的陣列
            };
          });
          this.init(processedRecords);
          this.total = res.result.total;
        }
      });
    },
    //添加会员提交
    addMemberSubmit() {
      this.$refs.addMemberForm.validate((valid) => {
        if (valid) {
          API_Circle.addPost(this.addMemberForm).then((res) => {
            if (res.code==200) {
              this.$refs.addMemberForm.resetFields();
              this.getData();
              this.$Message.success("添加成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },
    editMemberSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          API_Circle.editPost(this.form).then((res) => {
            if (res.result) {
              this.$refs.form.resetFields();
              this.getData();
              this.$Message.success("修改成功！");
              this.descFlag = false;
            }
          });
        }
      });
    },
    seeComment(v) {
      this.commentFlag = true;
      this.commentTitle = `评论列表`;
      API_Circle.getCommentList({ postId: v.id }).then(res => {
        this.commentList = res.result.records;
      })

    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
::v-deep .ivu-table-wrapper {
  width: 100%;
}

::v-deep .ivu-card {
  width: 100%;
}

.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.comment-item {
  padding: 5px;
  background: #eee;
  margin-bottom: 5px;
  border-radius: 5px;

  .comment-item-content {
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .comment-item-delete {
      cursor: pointer;
      color: #2d8cf0;
    }
  }
}
</style>
