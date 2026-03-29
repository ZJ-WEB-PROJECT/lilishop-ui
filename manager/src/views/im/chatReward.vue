<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="80" class="search-form">
          <Form-item label="打赏人ID" prop="fromMemberId">
            <Input type="text" v-model="searchForm.fromMemberId" placeholder="请输入打赏人ID" clearable style="width: 160px" />
          </Form-item>
          <Form-item label="打赏人名称" prop="fromMemberName">
            <Input type="text" v-model="searchForm.fromMemberName" placeholder="请输入打赏人名称" clearable style="width: 160px" />
          </Form-item>
          <Form-item label="试穿员ID" prop="toMemberId">
            <Input type="text" v-model="searchForm.toMemberId" placeholder="请输入试穿员ID" clearable style="width: 160px" />
          </Form-item>
          <Form-item label="试穿员名称" prop="toMemberName">
            <Input type="text" v-model="searchForm.toMemberName" placeholder="请输入试穿员名称" clearable style="width: 160px" />
          </Form-item>
          <Form-item label="礼物名称" prop="giftName">
            <Input type="text" v-model="searchForm.giftName" placeholder="请输入礼物名称" clearable style="width: 160px" />
          </Form-item>
          <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
        </Form>
      </Row>
    </Card>
    <Card>
<!--      <Row class="operation padding-row">-->
<!--        <Button @click="addChatGift" type="primary">添加打赏记录</Button>-->
<!--      </Row>-->

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

    <!-- 添加/编辑打赏记录模态框 -->
<!--    <Modal v-model="modalFlag" :title="modalTitle">-->
<!--      <Form ref="modalForm" :model="modalData" :rules="rule" :label-width="100">-->
<!--        <FormItem label="名称" prop="giftName" style="width: 90%;">-->
<!--          <Input v-model="modalData.giftName" clearable />-->
<!--        </FormItem>-->
<!--        <FormItem label="图片" prop="giftImage" style="width: 90%">-->
<!--          <Avatar-->
<!--            style="height: 100px; width: 100px"-->
<!--            v-if="modalData.giftImage"-->
<!--            shape="square"-->
<!--            icon="ios-person"-->
<!--            size="default"-->
<!--            :src="modalData.giftImage"-->
<!--          />-->
<!--          <div>-->
<!--            <Button @click="handleCLickImg" type="primary"-->
<!--            >选择图片</Button-->
<!--            >-->
<!--          </div>-->
<!--        </FormItem>-->
<!--        <FormItem label="价格" prop="coinPrice" style="width: 90%;">-->
<!--          <Input v-model.number="modalData.coinPrice" clearable />-->
<!--        </FormItem>-->
<!--        <FormItem label="排序" prop="sort" style="width: 90%;">-->
<!--          <Input v-model.number="modalData.sort" clearable />-->
<!--        </FormItem>-->
<!--        <FormItem label="状态" prop="status">-->
<!--          <RadioGroup button-style="solid" v-model="modalData.status">-->
<!--            <Radio :label="1">启用</Radio>-->
<!--            <Radio :label="0">禁用</Radio>-->
<!--          </RadioGroup>-->
<!--        </FormItem>-->
<!--      </Form>-->
<!--      <div slot="footer">-->
<!--        <Button @click="modalFlag = false">取消</Button>-->
<!--        <Button type="primary" @click="submit">确定</Button>-->
<!--      </div>-->
<!--    </Modal>-->
  </div>
</template>

<script>
import * as API_ChatGift from "@/api/im.js";
import ossManage from "@/views/sys/oss-manage/ossManage.vue";

export default {
  name: "chatGift",
  components: {
    ossManage,
  },
  data() {
    return {
      picModelFlag: false, // 图片选择器
      modalTitle: "", // modal标题
      loading: true, // 表单加载状态
      modalFlag: false, // modal显隐控制
      // 默认空表单（永久不变，用来重置）
      defaultForm: {
        id: "",
        giftName: "",
        giftImage: "",
        coinPrice: "",
        sort: "",
        status: 0,
      },
      modalData: {},
      searchForm: {
        // 请求参数
        pageNumber: 1,
        pageSize: 20, // 页面大小
        order: "desc",
        id: "",
        fromMemberId: "",
        fromMemberName: "",
        toMemberId: "",
        toMemberName: "",
      },
      // rule: {
      //   // 验证规则
      //   giftName: [
      //     { required: true, message: "请输入礼物名称" }
      //   ],
      //   coinPrice: [
      //     { required: true, message: "请输入价格" }
      //   ],
      //   giftImage: [{ required: true, message: "请上传图片" }],
      // },
      columns: [
        {
          title: "打赏人ID",
          key: "fromMemberId",
        },
        {
          title: "打赏人头像",
          key: "fromMemberAvatar",
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.fromMemberAvatar || require('@/assets/emptyImg.png'),
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
          title: "打赏人",
          key: "fromMemberName",
        },
        {
          title: "试穿员ID",
          key: "toMemberId",
        },
        {
          title: "试穿员头像",
          key: "toMemberAvatar",
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.toMemberAvatar || require('@/assets/emptyImg.png'),
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
          title: "试穿员",
          key: "toMemberName",
        },
        {
          title: "礼物名称",
          key: "giftName",
        },
        {
          title: "礼物图片",
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
          title: "单价",
          key: "coinPrice",
        },
        {
          title: "数量",
          key: "num",
        },
        {
          title: "总打赏金额",
          key: "totalCoin",
        },
        {
          title: "打赏时间",
          key: "createTime",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", { class: "ops" }, [
              // h(
              //   "a",
              //   {
              //     style: {
              //       color: "#2d8cf0",
              //       cursor: "pointer",
              //       textDecoration: "none",
              //     },
              //     on: {
              //       click: () => {
              //         this.edit(params.row);
              //       },
              //     },
              //   },
              //   "修改"
              // ),
              // h(
              //   "span",
              //   {
              //     style: {
              //       margin: "0 8px",
              //       color: "#dcdee2",
              //     },
              //   },
              //   "|"
              // ),
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
    };
  },
  methods: {
    // 选择图片modal
    handleCLickImg() {
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    // 图片回显
    callbackSelected(val) {
      this.picModelFlag = false;
      this.modalData.giftImage = val.url;
    },
    edit(v) {
      this.modalFlag = true;
      this.modalTitle = `修改打赏记录`;
      this.getChatGiftInfo(v.id);
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该打赏记录?",
        loading: true,
        onOk: () => {
          API_ChatGift.delChatReward(v.id).then((res) => {
            this.$Modal.remove();
            this.$Message.success("删除成功");
            this.getData();
          });
        },
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
    // 重置表单
    resetForm() {
      // 深拷贝 → 真正把表单恢复成空
      this.modalData = JSON.parse(JSON.stringify(this.defaultForm));
      this.$refs.modalForm.resetFields();
    },
    addChatGift() {
      this.modalFlag = true;
      this.modalTitle = `添加打赏记录`;
      this.resetForm();
      console.log(this.modalData);
    },
    /**
     * 查询查看打赏记录详情
     */
    getChatGiftInfo(id) {
      API_ChatGift.getChatGiftData(id).then((res) => {
        if (res.result) {
          this.modalData = JSON.parse(JSON.stringify(res.result));
        }
      });
    },

    //查询打赏记录列表
    getData() {
      API_ChatGift.getChatRewardList(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    //提交表单
    submit() {
      if(this.modalData.id){
        this.editChatGiftSubmit();
      }else{
        this.addChatGiftSubmit();
      }
    },
    //添加打赏记录提交
    addChatGiftSubmit() {
      this.$refs.modalForm.validate((valid) => {
        if (valid) {
          API_ChatGift.addChatGift(this.modalData).then((res) => {
            if (res.code==200) {
              this.resetForm();
              this.getData();
              this.$Message.success("添加成功！");
              this.modalFlag = false;
            }
          });
        }
      });
    },
    editChatGiftSubmit() {
      this.$refs.modalForm.validate((valid) => {
        if (valid) {
          API_ChatGift.editChatGift(this.modalData).then((res) => {
            if (res.result) {
              this.resetForm();
              this.getData();
              this.$Message.success("修改成功！");
              this.modalFlag = false;
            }
          });
        }
      });
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
