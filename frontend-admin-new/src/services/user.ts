import { apiRequest } from './request';
import {
    ShopUser,
    AdminUser,
    AdminRole,
    CreateAdminUserDto,
    UpdateAdminUserDto,
    UpdateShopUserDto,
    UserPageQuery,
    PageResponse,
    ApiResponse
} from '@/types/user';

// ==================== 商城用户相关API ====================

// 获取商城用户列表
export const getShopUsers = async (params?: UserPageQuery): Promise<ApiResponse<PageResponse<ShopUser>>> => {
    return apiRequest.get('/users', { params });
};

// 获取商城用户详情
export const getShopUser = async (id: number): Promise<ApiResponse<ShopUser>> => {
    return apiRequest.get(`/users/${id}`);
};

// 更新商城用户信息
export const updateShopUser = async (id: number, data: UpdateShopUserDto): Promise<ApiResponse<ShopUser>> => {
    return apiRequest.patch(`/users/${id}`, data);
};

// 删除商城用户
export const deleteShopUser = async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest.delete(`/users/${id}`);
};

// 检查商城用户是否可以删除
export const checkShopUserDeletable = async (id: number): Promise<ApiResponse<{
    canDelete: boolean;
    relatedData: {
        products: number;
        comments: number;
        carts: number;
        orders: number;
    };
}>> => {
    return apiRequest.get(`/users/${id}/check-deletable`);
};

// 强制删除商城用户（包括关联数据）
export const forceDeleteShopUser = async (id: number, options?: {
    deleteProducts?: boolean;
    deleteComments?: boolean;
    deleteCarts?: boolean;
    deleteOrders?: boolean;
}): Promise<ApiResponse<void>> => {
    const params = new URLSearchParams();
    params.append('force', 'true');

    if (options?.deleteProducts) params.append('deleteProducts', 'true');
    if (options?.deleteComments) params.append('deleteComments', 'true');
    if (options?.deleteCarts) params.append('deleteCarts', 'true');
    if (options?.deleteOrders) params.append('deleteOrders', 'true');

    return apiRequest.delete(`/users/${id}?${params.toString()}`);
};

// ==================== 管理员用户相关API ====================

// 获取管理员用户列表（支持分页和搜索）
export const getAdminUsers = async (params?: UserPageQuery): Promise<ApiResponse<PageResponse<AdminUser>>> => {
    return apiRequest.get('/admin/users', { params });
};

// 获取管理员用户详情
export const getAdminUser = async (id: number): Promise<ApiResponse<AdminUser>> => {
    return apiRequest.get(`/admin/users/${id}`);
};

// 创建管理员用户
export const createAdminUser = async (data: CreateAdminUserDto): Promise<ApiResponse<AdminUser>> => {
    return apiRequest.post('/admin/users', data);
};

// 更新管理员用户信息
export const updateAdminUser = async (id: number, data: UpdateAdminUserDto): Promise<ApiResponse<AdminUser>> => {
    return apiRequest.patch(`/admin/users/${id}`, data);
};

// 删除管理员用户
export const deleteAdminUser = async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest.delete(`/admin/users/${id}`);
};

// 重置管理员用户密码
export const resetAdminUserPassword = async (id: number): Promise<ApiResponse<{ message: string; newPassword: string }>> => {
    return apiRequest.post(`/admin/users/${id}/reset-password`);
};

// 启用/禁用管理员用户
export const toggleAdminUserStatus = async (id: number, status: number): Promise<ApiResponse<AdminUser>> => {
    return apiRequest.patch(`/admin/users/${id}/status?status=${status}`);
};

// ==================== 角色相关API ====================

// 获取所有角色列表
export const getAdminRoles = async (): Promise<ApiResponse<AdminRole[]>> => {
    // 注意：这个API可能需要根据实际后端实现调整
    return apiRequest.get('/admin/roles');
};