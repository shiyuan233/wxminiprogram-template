
import axios from "./index";

/**
 * get 请求方式
 * @param url {String} 接口地址
 * @param params {Object} 接口参数
 * @returns {AxiosPromise}
 * @constructor
 */
export function mGet(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, params)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * post 请求方式
 * @param url {String} 接口地址
 * @param data {Object} 接口参数
 * @returns {AxiosPromise}
 * @constructor
 */
export function mPost(url, data) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * put 请求方式-用于修改全部数据
 * @param url {String} 接口地址
 * @param data {Object} 接口参数
 * @returns {AxiosPromise}
 * @constructor
 */
export function mPut(url, data) {
  return new Promise((resolve, reject) => {
    axios
      .put(url, data)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * patch 请求方式-用于修改单项或多项数据
 * @param url {String} 接口地址
 * @param data {Object} 接口参数
 * @returns {AxiosPromise}
 * @constructor
 */
export function mPatch(url, data) {
  return new Promise((resolve, reject) => {
    axios
      .patch(url, data)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * delete 请求方式
 * @param url {String} 接口地址
 * @param params {Object} 接口参数
 * @returns {AxiosPromise}
 */
export function mDelete(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, params)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}