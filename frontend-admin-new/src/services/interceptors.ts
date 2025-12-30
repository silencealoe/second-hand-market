import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 请求配置接口
export interface ApiConfig extends InternalAxiosRequestConfig {
    skipAuth?: boolean; // 是否跳过认证
    skipErrorHandler?: boolean; // 是否跳过错误处理
}

// 统一错误处理函数
const handleApiError = (error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;

    switch (status) {
        case 401:
            // Token 过期或无效
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
            break;
        case 403:
            console.error('权限不足:', message);
            break;
        case 404:
            console.error('请求的资源不存在:', message);
            break;
        case 500:
            console.error('服务器内部错误:', message);
            break;
        default:
            console.error('请求失败:', message);
    }
};

// 请求拦截器 - 添加认证和日志
export const createAuthRequestInterceptor = () => {
    return (config: ApiConfig) => {
        // 添加认证 token
        if (!config.skipAuth) {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // 开发环境下打印请求信息
        if (import.meta.env.DEV) {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                params: config.params,
                data: config.data,
            });
        }

        return config;
    };
};

// 请求错误拦截器
export const createRequestErrorInterceptor = () => {
    return (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    };
};

// 响应成功拦截器
export const createResponseSuccessInterceptor = () => {
    return (response: AxiosResponse) => {
        // 开发环境下打印响应信息
        if (import.meta.env.DEV) {
            console.log('✅ API Response:', {
                method: response.config.method?.toUpperCase(),
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        // 如果响应类型是 blob，直接返回 response.data (Blob 对象)
        if (response.config.responseType === 'blob') {
            return response.data;
        }

        return response.data;
    };
};

// 响应错误拦截器
export const createResponseErrorInterceptor = () => {
    return (error: AxiosError) => {
        const config = error.config as ApiConfig;

        // 开发环境下打印错误信息
        if (import.meta.env.DEV) {
            console.error('❌ API Error:', {
                method: error.config?.method?.toUpperCase(),
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
            });
        }

        // 统一错误处理
        if (!config?.skipErrorHandler) {
            handleApiError(error);
        }

        return Promise.reject(error);
    };
};

// 设置请求拦截器
export const setupRequestInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.request.use(
        createAuthRequestInterceptor(),
        createRequestErrorInterceptor()
    );
};

// 设置响应拦截器
export const setupResponseInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.response.use(
        createResponseSuccessInterceptor(),
        createResponseErrorInterceptor()
    );
};

// 设置所有拦截器的便捷函数
export const setupInterceptors = (instance: AxiosInstance) => {
    setupRequestInterceptor(instance);
    setupResponseInterceptor(instance);
};

// 设置公开API拦截器（跳过认证）
export const setupPublicInterceptors = (instance: AxiosInstance) => {
    // 请求拦截器 - 跳过认证
    instance.interceptors.request.use((config: ApiConfig) => {
        config.skipAuth = true;

        // 开发环境下打印请求信息
        if (import.meta.env.DEV) {
            console.log('🚀 Public API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                params: config.params,
                data: config.data,
            });
        }

        return config;
    });

    // 设置响应拦截器
    setupResponseInterceptor(instance);
};