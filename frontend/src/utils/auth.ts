import type { User, LoginResponseDto } from '@/types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// 保存登录信息
export const saveAuth = (data: LoginResponseDto) => {
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
}

// 获取 token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

// 获取用户信息
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

// 清除登录信息
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

