<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="180" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="首次充值赠送平台币" prop="recharge">
        <Input type="number" v-model="formValidate.recharge">
          <span slot="append">平台币</span>
        </Input>
      </FormItem>
      <FormItem label="发送IM消息消费平台币" prop="consumer">
        <Input type="number" v-model="formValidate.consumer">
          <span slot="append">平台币</span>
        </Input>
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
      ruleValidate: {}, // 验证规则
      formValidate: {}, // 表单数据
      result: "",
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
        this.setupSetting();
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
    delSign(item, index) {
      this.formValidate.coinSettingItems.splice(index, 1);
    },
    addSign() {
      if (this.formValidate.coinSettingItems.length >= 4) {
        this.$Message.error({
          content: "最多设置4项签到设置",
        });
        return false;
      }
      this.formValidate.coinSettingItems.push({
        coin: "0",
        day: this.formValidate.coinSettingItems.length,
      });
    },
    // 实例化数据
    init() {
      this.result = JSON.parse(this.res);
      Object.keys(this.result).map((item) => {
        if (item == "coinSettingItems") {
          return false;
        }
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
          {
            validator: (rule, value, callback) => {
              if (value < 0) {
                callback(new Error("不能输入负数！"));
              } else {
                callback();
              }
            },
            trigger: "change",
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

  > .ivu-input-number {
    width: 100px;
    margin-right: 5px;
  }

  > .ivu-input-number:nth-last-of-type(1) {
    width: 150px;
    margin-right: 5px;
  }

  > .ivu-input {
    width: 100px;
    margin: 0 10px;
  }
}

::v-deep .ivu-input {
  width: 70px !important;
}

.ivu-input-wrapper {
  width: 70px;
  margin-right: 10px;
}

.label-btns {
  ::v-deep .ivu-btn {
    margin-right: 10px;
  }
}
</style>
