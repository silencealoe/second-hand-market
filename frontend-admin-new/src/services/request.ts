import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors, setupPublicInterceptors } from './interceptors';

const API_BASE_URL = '/api';

// 创建 axios 实例
const createApiInstance = (config?: AxiosRequestConfig): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        ...config,
    });

    // 设置拦截器
    setupInterceptors(instance);

    return instance;
};

// 创建公开 API 实例
const createPublicApiInstance = (config?: AxiosRequestConfig): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        ...config,
    });

    // 设置公开API拦截器（跳过认证）
    setupPublicInterceptors(instance);

    return instance;
};

// 默认的 API 实例
export const apiRequest = createApiInstance();

// 文件上传专用实例
export const uploadRequest = createApiInstance({
    timeout: 30000, // 文件上传需要更长的超时时间
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

// 导出数据专用实例
export const exportRequest = createApiInstance({
    timeout: 60000, // 导出可能需要更长时间
    responseType: 'blob',
});

// 公开 API 实例（不需要认证）
export const publicRequest = createPublicApiInstance();

export default apiRequest;