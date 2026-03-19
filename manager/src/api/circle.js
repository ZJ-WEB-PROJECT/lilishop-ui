import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "@/libs/axios";

//   获取分页
export const getPostList = (params) => {
  return getRequest("/circle/post/list", params);
};


// 删除
export const delPost = (id) => {
  return deleteRequest(`/circle/post/delete/${id}`);
};


// 添加
export const addPost = (data) => {
  return postRequest("/circle/post/create", data, { 'Content-Type': 'application/json' });
};

// 编辑
export const editPost = (data) => {
  return putRequest(`/circle/post/${data.id}`, data, { 'Content-Type': 'application/json' });
};

//   获取评论
export const getCommentList = (params) => {
  return getRequest("/circle/post/comment", params);
};

// 删除评论
export const delComment = (id) => {
  return deleteRequest(`/circle/post/comment/delete/${id}`);
};
