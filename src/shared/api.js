import axios from "axios";
import { getCookie } from "./Cookie";
// const token = getCookie("jwtToken");
const token = sessionStorage.getItem("jwtToken");

const instance = axios.create({
  baseURL: process.env.REACT_APP_MYINSTA_API_BASE_URL_ssj,
});

// var formData = new FormData();

// formData.append("id", data.id);
// formData.append("password", data.pwd);
// formData.append("nickname", data.user_name);

export const setFormData = (data) => {
  // data.forEach((cur, idx) => {
  //   formData.append(`${cur[idx]}`, data.cur[idx]);
  // });
  const asb = Object.keys(data).map((key) => {
    formData.append(key, data.key);
  });
};
export const asb = (data) =>
  Object.keys(data).map((key) => {
    formData.append(key, data.key);
  });
const formData = new FormData();

export const userApi = {
  //회원가입
  signup: (data) => {
    instance.post("user/signup", {
      userEmail: data.id,
      password: data.pwd,
      nickname: data.user_name,
    });
  },
  login: (data) =>
    instance.post("user/login", {
      username: data.id,
      password: data.pwd,
    }),
};

export { instance, token };
