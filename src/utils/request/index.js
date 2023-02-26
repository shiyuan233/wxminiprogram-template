
import axios from "./axios";
// import { getToken } from "@u/auth";

/**
 * axios defaults 配置
 */
axios.defaults = {
  baseUrl: "http://rap2.taobao.org:38080/",
  timeout: 60000,
};

/**
 * 全局 请求拦截器, 支持添加多个拦截器
 * 例如: 配置token、添加一些默认的参数
 * `return config` 继续发送请求
 */
axios.interceptors.request.use(
  (config) => {
    // 设置Token
    if (config.method === "post") {
      config.data = {
        ...config.data,
        //access_token: getToken(),
        _t: Date.parse(new Date()) / 1000
      };
    } else if (config.method === "get") {
      config.params = {
        ...config.params,
        //access_token: getToken(),
        _t: Date.parse(new Date()) / 1000
      };
    }
    return config;
  },
  (error) => {
    // 做一些请求错误
    console.error(error);
    return Promise.reject(error);
  }
);

/**
 * 全局 响应拦截器, 支持添加多个拦截器
 * 例如: 根据状态码选择性拦截、过滤转换数据
 * @param {Object} res 请求返回的数据
 * @return {Promise<reject>}
 */
axios.interceptors.response.use(
  async (res) => {
    const { data, statusCode: status } = res;

    try {
      return await handleCode({ data, status });
    } catch (err) {
      return Promise.reject(err);
    }
  },
  (err) => {
    // 做一些请求错误
    console.error(err);
    return Promise.reject(err);
  }
);

/**
 * 处理 HTTP 状态码
 * @param data {Object} 请求返回的数据
 * @param status {String} HTTP状态码
 * @returns {Promise<never>|*}
 */
function handleCode({ data, status }) {
  const STATUS = {
    "200"() {
      return data;
    },
    "400"() {
      return Promise.reject(new Error("请求错误"));
    },
    "401"() {
      return Promise.reject(new Error("请求未授权"));
    },
    "403"() {
      return Promise.reject(new Error("拒绝请求"));
    },
    "500"() {
      return Promise.reject(new Error("服务器错误"));
    },
  };
  // 有状态码但不在这个封装的配置里，就直接返回错误
  return STATUS[status]
    ? STATUS[status]()
    : Promise.reject(new Error(data.data || "请求错误"));
}

export default axios;