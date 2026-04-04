<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="名称" prop="name">
        <Input v-model="formValidate.name"/>
      </FormItem>
      <FormItem label="金额" prop="price">
        <Input v-model="formValidate.price"/>
      </FormItem>
      <FormItem label="描述" prop="desc">
        <Input v-model="formValidate.desc"/>
      </FormItem>

      <div class="label-btns">
        <Button type="primary" @click="submit('formValidate')">保存</Button>

      </div>
    </Form>
  </div>
</template>
<script>
import {setSetting} from "@/api/index";
import {handleSubmit} from "./validate";

export default {
  data() {
    return {
      result: "",
      ruleValidate: {}, // 验证规则
      formValidate: { // 表单数据
        name:"",
        price:"",
        desc:"",
      },
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    // 保存
    submit(name) {
      let that = this;
      if (handleSubmit(that, name)) {
        this.setupSetting()
      }
    },
    // 保存设置
    setupSetting() {
      const params = {
        ...this.formValidate,
        price: Number(this.formValidate.price)
      };
      setSetting(this.type, params).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
        } else {
          this.$Message.error("保存失败!");
        }
      });
    },
    // 实例化数据
    init() {
      this.result = JSON.parse(this.res);

      // 修复：只对非数字字段转 String，price 保持数字/空
      Object.keys(this.result).forEach((item) => {
        if (item !== "price") {
          this.result[item] = this.result[item] ? String(this.result[item]) : "";
        }
      });

      this.$set(this, "formValidate", {...this.result});

      // 给 price 额外加「数字校验」，避免输入非数字
      this.ruleValidate = {
        name: [
          { required: true, message: "请填写必填项", trigger: "blur" }
        ],
        price: [
          { required: true, message: "请填写必填项", trigger: "blur" },
          {
            pattern: /^\d+(\.\d{1,2})?$/,
            message: "请输入正确的金额（最多两位小数）",
            trigger: "blur"
          }
        ],
        desc: [
          { required: true, message: "请填写必填项", trigger: "blur" }
        ]
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./style.scss";

.label-item {
  display: flex;
}

::v-deep .ivu-input {
  width: 300px !important;
  margin: 0 10px;
}

.ivu-input-wrapper {
  width: 300px;
  margin-right: 10px;
}
</style>
