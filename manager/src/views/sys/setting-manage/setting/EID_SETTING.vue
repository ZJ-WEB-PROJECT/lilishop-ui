<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="状态" prop="isOpen">
        <RadioGroup type="button" button-style="solid" v-model="formValidate.isOpen">
          <Radio label="true">开启</Radio>
          <Radio label="false">关闭</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="腾讯云SecretId" prop="secretId">
        <Input v-model="formValidate.secretId"/>
      </FormItem>
      <FormItem label="腾讯云SecretKey" prop="secretKey">
        <Input v-model="formValidate.secretKey"/>
      </FormItem>
      <FormItem label="E证通商户ID" prop="merchantId">
        <Input v-model="formValidate.merchantId"/>
      </FormItem>
      <FormItem label="地域" prop="region">
        <Input v-model="formValidate.region"/>
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
        isTestModel:1,
        loginTemplateCode:"",
        registerTemplateCode:"",
        findPasswordTemplateCode:"",
        walletPasswordTemplateCode:"",
        payPasswordTemplateCode:"",
        accessKeyId: "",
        regionId: "",
        picLocation: "",
        accessSecret: "",
        tencentSecretId: "",
        tencentSecretKey: "",
        tencentSdkAppId: "",
        tencentSignName: "",
        huaweiAppKey: "",
        huaweiAppSecret: "",
        huaweiSender: "",
        huaweiSignature: "",
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
      setSetting(this.type, this.formValidate).then((res) => {
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

      Object.keys(this.result).map((item) => {
        this.result[item] += "";
      });

      this.$set(this, "formValidate", {...this.result});
      Object.keys(this.formValidate).forEach((item) => {
        this.ruleValidate[item] = [
          {
            required: true,
            message: "请填写必填项",
            trigger: "blur",
          },
        ];
      });
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
