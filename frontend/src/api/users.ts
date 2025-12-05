import request from './request'
import type { RegisterDto, LoginDto, LoginResponseDto, User, UpdateUserDto } from '@/types'

// 用户注册
export const register = (data: RegisterDto) => {
  return request.post<LoginResponseDto>('/users/register', data)
}

// 用户登录
export const login = (data: LoginDto) => {
  return request.post<LoginResponseDto>('/users/login', data)
}

// 获取所有用户列表
export const getAllUsers = () => {
  return request.get<User[]>('/users')
}

// 根据ID获取用户信息
export const getUserById = (id: number) => {
  return request.get<User>(`/users/${id}`)
}

// 更新用户信息
export const updateUser = (id: number, data: UpdateUserDto) => {
  return request.patch<User>(`/users/${id}`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete(`/users/${id}`)
}

