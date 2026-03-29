<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="礼物名称" prop="giftName">
            <Input type="text" v-model="searchForm.giftName" placeholder="请输入礼物名称" clearable style="width: 240px" />
          </Form-item>
          <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
        </Form>
      </Row>
    </Card>
    <Card>
      <Row class="operation padding-row" v-if="!selectedMember">
        <Button @click="addMember" type="primary">添加礼物</Button>
      </Row>

      <Table :loading="loading" :columns="columns" class="mt_10" :data="data" ref="table"></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
          @on-page-size-change="changePageSize" :page-size-opts="[20, 50, 100]" size="small" show-total show-elevator
          show-sizer></Page>
      </Row>
    </Card>

    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" :isComponent="true" :initialize="picModelFlag" ref="ossManage" />
    </Modal>

    <!-- 添加/编辑用户模态框 -->
    <Modal v-model="addFlag" :title="descTitle">
      <Form ref="chatGiftForm" :model="chatGiftData" :rules="addRule" :label-width="100">
        <FormItem label="名称" prop="giftName" style="width: 90%;">
          <Input v-model="chatGiftData.giftName" clearable />
        </FormItem>
        <FormItem label="图片" prop="giftImage" style="width: 90%">
<!--          <upload-pic-thumb v-model="chatGiftData.giftImage" :multiple="false" :isView="true" :directoryPath="'chatGift'" :key="chatGiftData.id || 'new'"></upload-pic-thumb>-->
<!--          <ossManage @callback="callbackSelected" :isComponent="true" :initialize="picModelFlag" ref="ossManage" />-->
          <Avatar
            style="height: 100px; width: 100px"
            v-if="chatGiftData.giftImage"
            shape="square"
            icon="ios-person"
            size="default"
            :src="chatGiftData.giftImage"
          />
          <div>
            <Button @click="handleCLickImg('storeLogo')" type="primary"
            >选择图片</Button
            >
          </div>
        </FormItem>
        <FormItem label="价格" prop="coinPrice" style="width: 90%;">
          <Input v-model.number="chatGiftData.coinPrice" clearable />
        </FormItem>
        <FormItem label="排序" prop="sort" style="width: 90%;">
          <Input v-model.number="chatGiftData.sort" clearable />
        </FormItem>
        <FormItem label="状态" prop="status">
          <RadioGroup button-style="solid" v-model="chatGiftData.status">
            <Radio :label="1">启用</Radio>
            <Radio :label="0">禁用</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" @click="submit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// import multipleMap from "@/components/map/multiple-map";
import * as API_ChatGift from "@/api/im.js";
import uploadPicThumb from "@/components/lili/upload-pic-thumb";
import editor from "@/components/editor/index.vue";
import ossManage from "@/views/sys/oss-manage/ossManage.vue";

export default {
  name: "chatGift",
  components: {
    editor,
    // multipleMap,
    ossManage,
    uploadPicThumb,
  },
  data() {
    return {
      picModelFlag: false, // 图片选择器
      descTitle: "", // modal标题
      descFlag: false, //编辑查看框
      loading: true, // 表单加载状态
      addFlag: false, // modal显隐控制
      // 默认空表单（永久不变，用来重置）
      defaultForm: {
        id: "",
        giftName: "",
        giftImage: "",
        coinPrice: "",
        sort: "",
        status: 0,
      },
      chatGiftData: {
        id: "",
        giftName: "",
        giftImage: "",
        coinPrice: "",
        sort: "",
        status: 0,
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
        giftName: [
          { required: true, message: "请输入礼物名称" }
        ],
        coinPrice: [
          { required: true, message: "请输入价格" }
        ],
        giftImage: [{ required: true, message: "请上传图片" }],
      },
      ruleValidate: {}, //修改验证
      columns: [
        {
          title: "礼物名称",
          key: "giftName",
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          render: (h, params) => {
            const status = params.row.status;
            const text = status ? "启用" : "禁用";

            return h("span", text);
          }
        },
        {
          title: "图片",
          key: "giftImage",
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.giftImage || require('@/assets/emptyImg.png'),
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
          title: "价格",
          key: "coinPrice",
        },
        {
          title: "排序",
          key: "sort",
        },
        {
          title: "创建时间",
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
    // 选择图片modal
    handleCLickImg(val, index) {
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    // 图片回显
    callbackSelected(val) {
      this.picModelFlag = false;
      console.log(val)
      this.chatGiftData.giftImage = val.url;
    },
    // 回调给父级
    callback(val, index) {
      this.selectMember.forEach(item => { item.___selected = false })
      this.$set(val, "___selected", !val.___selected);
      console.log(val.___selected);
      console.log(this.selectMember);
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
      console.log('edit', v);
      this.addFlag = true;
      this.descTitle = `修改礼物`;
      this.chatGiftData = JSON.parse(JSON.stringify(v));
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该礼物?",
        loading: true,
        onOk: () => {
          API_ChatGift.delChatGift(v.id).then((res) => {
            this.$Modal.remove();
            this.$Message.success("删除成功");
            this.getData();
          });
        },
      });
    },

    deleteComment(v) {
      API_ChatGift.delComment(v.id).then((res) => {
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
    resetForm() {
      // 深拷贝 → 真正把表单恢复成空
      this.chatGiftData = JSON.parse(JSON.stringify(this.defaultForm));
      this.$refs.chatGiftForm.resetFields();
    },
    addMember() {
      this.addFlag = true;
      this.descTitle = `添加礼物`;
      this.resetForm();
      console.log(this.chatGiftData);
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
      API_ChatGift.getChatGiftList(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
        }
      });
    },
    //提交表单
    submit() {
      if(this.chatGiftData.id){
        this.editMemberSubmit();
      }else{
        this.addMemberSubmit();
      }
    },
    //添加会员提交
    addMemberSubmit() {
      this.$refs.chatGiftForm.validate((valid) => {
        if (valid) {
          API_ChatGift.addChatGift(this.chatGiftData).then((res) => {
            if (res.code==200) {
              this.resetForm();
              this.getData();
              this.$Message.success("添加成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },
    editMemberSubmit() {
      this.$refs.chatGiftForm.validate((valid) => {
        if (valid) {
          API_ChatGift.editChatGift(this.chatGiftData).then((res) => {
            if (res.result) {
              this.resetForm();
              this.getData();
              this.$Message.success("修改成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },
    seeComment(v) {
      this.commentFlag = true;
      this.commentTitle = `评论列表`;
      API_ChatGift.getCommentList({ postId: v.id }).then(res => {
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
