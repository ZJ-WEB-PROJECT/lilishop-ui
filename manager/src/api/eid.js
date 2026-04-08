import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "@/libs/axios";

//   获取分页
export const getEidList = (params) => {
  return getRequest("/eid/list", params);
};


// 删除
export const delEid = (id) => {
  return deleteRequest(`/eid/delete/${id}`);
};


// 添加
export const addEid = (data) => {
  return postRequest("/eid/create", data, { 'Content-Type': 'application/json' });
};

// 编辑
export const editEid = (data) => {
  return putRequest(`/eid/${data.id}`, data, { 'Content-Type': 'application/json' });
};
