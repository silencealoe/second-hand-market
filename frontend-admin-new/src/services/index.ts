// 统一导出所有 API 服务
export * from './auth';
export * from './dashboard';
export * from './user';
export * from './system';

// 导出 axios 实例
export { apiRequest, uploadRequest, exportRequest, publicRequest } from './request';

// 导出拦截器配置（用于自定义实例）
export {
    setupInterceptors,
    setupRequestInterceptor,
    setupResponseInterceptor,
    setupPublicInterceptors,
    createAuthRequestInterceptor,
    createResponseSuccessInterceptor,
    createResponseErrorInterceptor,
    type ApiConfig
} from './interceptors';