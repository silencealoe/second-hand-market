import axios from 'axios';

// 创建axios实例，配置baseURL为/api，用于代理到后端3000端口
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 检查响应格式是否包含code字段
    if (res.code !== undefined) {
      // 成功情况
      if (res.code === 200) {
        return res.data;
      } else {
        // 失败情况，返回错误信息
        return Promise.reject(new Error(res.message || '操作失败'));
      }
    }
    
    // 兼容旧格式（如果有的话）
    return res;
  },
  (error) => {
    // 处理HTTP状态码错误
    if (error.response) {
      // 401错误处理
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // 处理其他HTTP状态码错误
      const res = error.response.data;
      const errorMessage = res.message || res.msg || '请求失败';
      return Promise.reject(new Error(errorMessage));
    }
    
    // 网络错误等其他情况
    return Promise.reject(new Error('网络错误，请稍后重试'));
  }
);

export default request;
