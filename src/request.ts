import axios from 'axios'
import { message } from 'ant-design-vue'
//创建Axios实例
// 区分开发和生产环境
const DEV_BASE_URL = "http://localhost:8666";
const PROD_BASE_URL = "http://49.234.204.205";
// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: DEV_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 全局请求拦截器,暂时无须对请求拦截器做任何处理
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response
    // 判断未登录逻辑
    if (data.code === 40100) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&//如果不是获取登录用户信息的接口
        !window.location.pathname.includes('/user/login')//已经在登录页面
      ) {
        message.warning('请先登录')
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default myAxios
