<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员ID" prop="memberId">
            <Input type="text" v-model="searchForm.memberId" placeholder="会员ID" clearable style="width: 240px" />
          </Form-item>
          <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
        </Form>
      </Row>
    </Card>
    <Card>
<!--      <Row class="operation padding-row">-->
<!--        <Button @click="addEid" type="primary">添加会员E证通核身记录</Button>-->
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

    <!-- 添加/编辑会员E证通核身记录模态框 -->
    <Modal v-model="modalFlag" :title="modalTitle">
      <Form ref="modalForm" :model="modalData" :rules="rule" :label-width="100">
        <FormItem label="名称" prop="giftName" style="width: 90%;">
          <Input v-model="modalData.giftName" clearable />
        </FormItem>
        <FormItem label="图片" prop="giftImage" style="width: 90%">
          <Avatar
            style="height: 100px; width: 100px"
            v-if="modalData.giftImage"
            shape="square"
            icon="ios-person"
            size="default"
            :src="modalData.giftImage"
          />
          <div>
            <Button @click="handleCLickImg" type="primary"
            >选择图片</Button
            >
          </div>
        </FormItem>
        <FormItem label="价格" prop="coinPrice" style="width: 90%;">
          <Input v-model.number="modalData.coinPrice" clearable />
        </FormItem>
        <FormItem label="排序" prop="sort" style="width: 90%;">
          <Input v-model.number="modalData.sort" clearable />
        </FormItem>
        <FormItem label="状态" prop="status">
          <RadioGroup button-style="solid" v-model="modalData.status">
            <Radio :label="1">启用</Radio>
            <Radio :label="0">禁用</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="modalFlag = false">取消</Button>
        <Button type="primary" @click="submit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Eid from "@/api/eid.js";
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
        username: "",
        mobile: "",
      },
      rule: {
        // 验证规则
        giftName: [
          { required: true, message: "请输入会员E证通核身记录名称" }
        ],
        coinPrice: [
          { required: true, message: "请输入价格" }
        ],
        giftImage: [{ required: true, message: "请上传图片" }],
      },
      columns: [
        {
          title: "会员ID",
          key: "memberId",
        },
        {
          title: "状态",
          key: "status",
        },
        {
          title: "姓名",
          key: "name",
        },
        {
          title: "身份证",
          key: "idCard",
        },
        {
          title: "民族",
          key: "ocrNation",
        },
        {
          title: "家庭住址",
          key: "ocrAddress",
        },
        {
          title: "生日",
          key: "ocrBirth",
        },
        {
          title: "性别",
          key: "ocrGender",
        },
        {
          title: "错误码",
          key: "errCode",
        },
        {
          title: "错误信息",
          key: "errMsg",
        },
        {
          title: "创建时间",
          key: "createTime",
        },
        // {
        //   title: "操作",
        //   key: "action",
        //   align: "center",
        //   fixed: "right",
        //   render: (h, params) => {
        //     return h("div", { class: "ops" }, [
        //       h(
        //         "a",
        //         {
        //           style: {
        //             color: "#2d8cf0",
        //             cursor: "pointer",
        //             textDecoration: "none",
        //           },
        //           on: {
        //             click: () => {
        //               this.edit(params.row);
        //             },
        //           },
        //         },
        //         "修改"
        //       ),
        //       h(
        //         "span",
        //         {
        //           style: {
        //             margin: "0 8px",
        //             color: "#dcdee2",
        //           },
        //         },
        //         "|"
        //       ),
        //       h(
        //         "a",
        //         {
        //           style: {
        //             color: "#2d8cf0",
        //             cursor: "pointer",
        //             textDecoration: "none",
        //           },
        //           on: {
        //             click: () => {
        //               this.remove(params.row);
        //             },
        //           },
        //         },
        //         "删除"
        //       ),
        //     ]);
        //   },
        // },
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
      this.modalTitle = `修改会员E证通核身记录`;
      this.getEidInfo(v.id);
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该会员E证通核身记录?",
        loading: true,
        onOk: () => {
          API_Eid.delEid(v.id).then((res) => {
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
    addEid() {
      this.modalFlag = true;
      this.modalTitle = `添加会员E证通核身记录`;
      this.resetForm();
      console.log(this.modalData);
    },
    /**
     * 查询查看会员E证通核身记录详情
     */
    getEidInfo(id) {
      API_Eid.getEidData(id).then((res) => {
        if (res.result) {
          this.modalData = JSON.parse(JSON.stringify(res.result));
        }
      });
    },

    //查询会员E证通核身记录列表
    getData() {
      API_Eid.getEidList(this.searchForm).then((res) => {
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
        this.editEidSubmit();
      }else{
        this.addEidSubmit();
      }
    },
    //添加会员E证通核身记录提交
    addEidSubmit() {
      this.$refs.modalForm.validate((valid) => {
        if (valid) {
          API_Eid.addEid(this.modalData).then((res) => {
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
    editEidSubmit() {
      this.$refs.modalForm.validate((valid) => {
        if (valid) {
          API_Eid.editEid(this.modalData).then((res) => {
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
