import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "@/libs/axios";

// 获取礼物分页
export const getChatGiftList = (params) => {
  return getRequest("/im/chat/gift/list", params);
};

// 获取礼物详情
export const getChatGiftData = (id) => {
  return getRequest(`/im/chat/gift/get/${id}`);
};

// 删除礼物
export const delChatGift = (id) => {
  return deleteRequest(`/im/chat/gift/delete/${id}`);
};

// 添加礼物
export const addChatGift = (data) => {
  return postRequest("/im/chat/gift/create", data, { 'Content-Type': 'application/json' });
};

// 编辑礼物
export const editChatGift = (data) => {
  return putRequest(`/im/chat/gift/${data.id}`, data, { 'Content-Type': 'application/json' });
};

// 获取打赏记录分页
export const getChatRewardList = (params) => {
  return getRequest("/im/chat/reward/list", params);
};

// 删除打赏记录
export const delChatReward = (id) => {
  return deleteRequest(`/im/chat/reward/delete/${id}`);
};

// 获取打赏统计分页
export const getMemberIncomeList = (params) => {
  return getRequest("/member/income/list", params);
};
