// 商城用户相关类型定义
export interface ShopUser {
    id: number;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

// 管理员用户相关类型定义
export interface AdminUser {
    id: number;
    username: string;
    realName?: string;
    phone?: string;
    avatar?: string;
    roleId?: number;
    status: number;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    role?: AdminRole;
}

// 管理员角色类型定义
export interface AdminRole {
    id: number;
    name: string;
    description?: string;
    permissions?: Record<string, boolean>;
    isSuper: number;
    status: number;
    createdAt: string;
    updatedAt: string;
}

// 创建管理员用户DTO
export interface CreateAdminUserDto {
    username: string;
    password: string;
    realName?: string;
    phone?: string;
    avatar?: string;
    roleId?: number;
    status?: number;
}

// 更新管理员用户DTO
export interface UpdateAdminUserDto {
    username?: string;
    realName?: string;
    phone?: string;
    avatar?: string;
    roleId?: number;
    status?: number;
}

// 更新商城用户DTO
export interface UpdateShopUserDto {
    username?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    address?: string;
}

// 分页查询参数
export interface UserPageQuery {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: number;
}

// API响应基础结构
export interface ApiResponse<T> {
    code: number;
    data: T;
}

// 分页响应数据
export interface PageResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// 用户状态枚举
export enum UserStatus {
    DISABLED = 0,
    ENABLED = 1,
}

// 角色类型枚举
export enum RoleType {
    NORMAL = 0,
    SUPER = 1,
}