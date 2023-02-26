
const axios = (function () {
  class Axios {
    constructor() {
      this.defaults = {
        baseUrl: "",
      };
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager(),
      };
    }

    wxRequest(c) {
      return new Promise((resolve, reject) => {
        c = this.interceptors.request.func(c);
        c.url = c.url.startsWith("http") ? c.url : c.baseUrl + c.url;
        c.success = (res) => {
          resolve(this.interceptors.response.func(res));
        };
        c.fail = (res) => {
          reject(this.interceptors.response.func(res));
        };
        wx.request(c);
      });
    }
  }

  Array.prototype.forEach.call(
    ["options", "get", "head", "post", "put", "delete", "trace", "connect"],
    function (m) {
      Axios.prototype[m] = function (url, data, config) {
        return this.wxRequest(
          merge(
            this.defaults,
            {
              url: url,
              method: m,
              data: data,
            },
            config || {}
          )
        );
      };
    }
  );

  class InterceptorManager {
    constructor() {
      this.func = function (data) {
        return data;
      };
    }
    use(fn) {
      this.func = fn;
    }
  }

  function merge(axiosDefaultConfig, data, config) {
    let cloneAxios = deepClone(axiosDefaultConfig);
    let cloneData = deepClone(data);
    let cloneConfig = deepClone(config);
    return Object.assign(cloneAxios, cloneData, cloneConfig);
  }

  // 深拷贝
  function deepClone(obj) {
    let _obj = JSON.stringify(obj),
      objClone = JSON.parse(_obj);
    return objClone;
  }

  return new Axios();
})();

export default axios;