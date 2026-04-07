var BASE = {
  /**
   * @description api请求基础路径
   */
  API_DEV: {
    common: "http://127.0.0.1:8890",
    buyer: "http://127.0.0.1:8889",
    seller: "http://127.0.0.1:8889",
    manager: "http://127.0.0.1:8889",
  },
  API_PROD: {
    common: "https://common-api.guiguishop.top",
    buyer: "https://buyer-api.guiguishop.top",
    seller: "https://store-api.guiguishop.top",
    manager: "https://admin-api.guiguishop.top",
  },
  /**
   * @description // 跳转买家端地址 pc端
   */
  PC_URL: "https://pc-b2b2c.guiguishop.top",
  /**
   * @description  // 跳转买家端地址 wap端
   */
  WAP_URL: "https://m-b2b2c.guiguishop.top",
  /**
   *  @description api请求基础路径前缀
   */
  PREFIX: "/store",
};
