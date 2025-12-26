import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { showToast } from '@nutui/nutui'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('response', response)
    if(response.config.url?.includes('/alipay')) {
      return response.data
    }
    return response.data.data
  },
  (error: any) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          showToast.fail('未授权，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 404:
          showToast.fail('请求的资源不存在')
          break
        case 409:
          showToast.fail(data?.message || '数据冲突')
          break
        default:
          showToast.fail(data?.message || '请求失败')
      }
    } else {
      showToast.fail('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default service

