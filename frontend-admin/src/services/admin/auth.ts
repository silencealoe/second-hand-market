import request from '@/utils/request';

// 登录请求参数
interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

// 登录API
export async function login(params: LoginParams): Promise<LoginResponse> {
  return request('/admin/auth/login', {
    method: 'POST',
    data: params,
  });
}

// 获取当前用户信息
export async function getProfile() {
  return request('/admin/auth/profile', {
    method: 'GET',
  });
}

// 退出登录
export async function logout() {
  return request('/admin/auth/logout', {
    method: 'POST',
  });
}

// 验证token
export async function validateToken() {
  return request('/admin/auth/validate-token', {
    method: 'GET',
  });
}