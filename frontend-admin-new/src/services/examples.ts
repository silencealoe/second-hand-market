/**
 * 拦截器使用示例
 * 
 * 本文件展示了如何使用重构后的拦截器系统
 */

import axios from 'axios';
import {
    setupInterceptors,
    setupPublicInterceptors,
    createAuthRequestInterceptor,
    createResponseSuccessInterceptor,
    createResponseErrorInterceptor,
    ApiConfig
} from './interceptors';
import { apiRequest, publicRequest, uploadRequest } from './request';

// 示例1: 使用默认的 API 实例
export const exampleUseDefaultInstance = async () => {
    try {
        // 自动添加认证头，统一错误处理
        const users = await apiRequest.get('/admin/users');
        console.log('Users:', users);
    } catch (error) {
        // 错误已被拦截器处理
        console.error('Error handled by interceptor');
    }
};

// 示例2: 使用公开 API 实例
export const exampleUsePublicInstance = async () => {
    try {
        // 不添加认证头
        const publicData = await publicRequest.get('/public/statistics');
        console.log('Public data:', publicData);
    } catch (error) {
        console.error('Public API error:', error);
    }
};

// 示例3: 使用上传实例
export const exampleFileUpload = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // 使用专门的上传实例，超时时间更长
        const result = await uploadRequest.post('/admin/upload', formData);
        console.log('Upload result:', result);
        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

// 示例4: 创建自定义 axios 实例
export const createCustomInstance = () => {
    const customInstance = axios.create({
        baseURL: '/custom-api',
        timeout: 5000,
        headers: {
            'Custom-Header': 'custom-value'
        }
    });

    // 使用完整的拦截器设置
    setupInterceptors(customInstance);

    return customInstance;
};

// 示例5: 创建只有部分拦截器的实例
export const createPartialInterceptorInstance = () => {
    const instance = axios.create({
        baseURL: '/partial-api',
        timeout: 3000,
    });

    // 只添加请求拦截器，不添加响应拦截器
    instance.interceptors.request.use(createAuthRequestInterceptor());

    return instance;
};

// 示例6: 跳过认证的请求
export const exampleSkipAuth = async () => {
    try {
        // 使用普通实例但跳过认证
        const data = await apiRequest.get('/admin/public-endpoint', {
            skipAuth: true
        } as ApiConfig);
        console.log('Data without auth:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

// 示例7: 跳过错误处理的请求
export const exampleSkipErrorHandler = async () => {
    try {
        const data = await apiRequest.get('/admin/might-fail', {
            skipErrorHandler: true
        } as ApiConfig);
        console.log('Success:', data);
    } catch (error) {
        // 自定义错误处理
        console.error('Custom error handling:', error);
        // 可以显示自定义的错误消息
    }
};

// 示例8: 创建专门用于第三方 API 的实例
export const createThirdPartyApiInstance = () => {
    const thirdPartyInstance = axios.create({
        baseURL: 'https://api.third-party.com',
        timeout: 10000,
        headers: {
            'API-Key': 'your-api-key'
        }
    });

    // 只添加响应拦截器，不添加认证
    thirdPartyInstance.interceptors.response.use(
        createResponseSuccessInterceptor(),
        createResponseErrorInterceptor()
    );

    return thirdPartyInstance;
};

// 示例9: 在组件中使用
export const ComponentExample = {
    // 在 React 组件中的使用示例
    async fetchUserData(userId: string) {
        try {
            const user = await apiRequest.get(`/admin/users/${userId}`);
            return user;
        } catch (error) {
            // 错误已被拦截器处理，这里只需要处理业务逻辑
            throw new Error('获取用户数据失败');
        }
    },

    async uploadAvatar(file: File) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const result = await uploadRequest.post('/admin/users/avatar', formData);
            return result;
        } catch (error) {
            throw new Error('头像上传失败');
        }
    }
};

// 示例10: 批量请求处理
export const exampleBatchRequests = async () => {
    try {
        // 并发请求，都会使用相同的拦截器
        const [users, roles, permissions] = await Promise.all([
            apiRequest.get('/admin/users'),
            apiRequest.get('/admin/roles'),
            apiRequest.get('/admin/permissions')
        ]);

        return { users, roles, permissions };
    } catch (error) {
        console.error('Batch request failed:', error);
        throw error;
    }
};