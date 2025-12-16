import request from './request'
import type { Order } from '@/types'

// 创建订单
interface CreateOrderParams {
  user_id: number
  product_id: number
  quantity: number
  shipping_address?: string
  payment_method?: string
}

export const createOrderAPI = (data: CreateOrderParams) => {
  return request.post<Order>('/orders', data)
}

// 获取用户订单列表
export const getUserOrdersAPI = (userId: number) => {
  return request.get<Order[]>(`/orders/user/${userId}`)
}

// 获取订单详情
export const getOrderByIdAPI = (id: number) => {
  return request.get<Order>(`/orders/${id}`)
}

// 更新订单
export const updateOrderAPI = (id: number, data: Partial<Order>) => {
  return request.patch<Order>(`/orders/${id}`, data)
}

// 删除订单
export const deleteOrderAPI = (id: number) => {
  return request.delete(`/orders/${id}`)
}