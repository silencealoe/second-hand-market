import { apiRequest } from './request';
import { LoginForm, LoginResponse } from '@/types';

// 登录API
export const login = async (loginForm: LoginForm): Promise<LoginResponse> => {
    return apiRequest.post('/admin/auth/login', loginForm);
};

// 获取用户信息API
export const getUserInfo = async () => {
    return apiRequest.get('/admin/auth/me');
};