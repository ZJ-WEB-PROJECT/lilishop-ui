import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "@/libs/axios";

//   获取分页
export const getChatGiftList = (params) => {
  return getRequest("/im/chat/gift/list", params);
};


// 删除
export const delChatGift = (id) => {
  return deleteRequest(`/im/chat/gift/delete/${id}`);
};


// 添加
export const addChatGift = (data) => {
  return postRequest("/im/chat/gift/create", data, { 'Content-Type': 'application/json' });
};

// 编辑
export const editChatGift = (data) => {
  return putRequest(`/im/chat/gift/${data.id}`, data, { 'Content-Type': 'application/json' });
};
