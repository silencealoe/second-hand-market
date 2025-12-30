import { apiRequest, publicRequest } from './request';
import { User } from '@/types';

// 获取用户列表 - 需要认证
export const getUserList = async (params: {
    page: number;
    pageSize: number;
    keyword?: string;
}) => {
    return apiRequest.get('/admin/users', { params });
};

// 获取用户详情 - 需要认证
export const getUserDetail = async (id: string): Promise<User> => {
    return apiRequest.get(`/admin/users/${id}`);
};

// 创建用户 - 需要认证
export const createUser = async (userData: Partial<User>) => {
    return apiRequest.post('/admin/users', userData);
};

// 更新用户 - 需要认证
export const updateUser = async (id: string, userData: Partial<User>) => {
    return apiRequest.put(`/admin/users/${id}`, userData);
};

// 删除用户 - 需要认证
export const deleteUser = async (id: string) => {
    return apiRequest.delete(`/admin/users/${id}`);
};

// 检查用户名是否可用 - 公开接口，不需要认证
export const checkUsernameAvailable = async (username: string) => {
    return publicRequest.get('/public/check-username', {
        params: { username }
    });
};