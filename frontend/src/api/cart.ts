import request from './request'
import type { CartItem, Product } from '@/types'

// 添加商品到购物车
export const addToCartAPI = (user_id: number, product_id: number, quantity: number = 1) => {
  return request.post('/carts', { user_id, product_id, quantity })
}

// 获取用户购物车列表
export const getCartListAPI = (user_id: number) => {
  return request.get('/carts', { params: { user_id } })
}

// 更新购物车商品数量或选中状态
export const updateCartItemAPI = (id: number, user_id: number, data: { quantity?: number; selected?: boolean }) => {
  return request.patch(`/carts/${id}`, data, { params: { user_id } })
}

// 删除购物车商品
export const deleteCartItemAPI = (id: number, user_id: number) => {
  return request.delete(`/carts/${id}`, { params: { user_id } })
}

// 清空购物车
export const clearCartAPI = (user_id: number) => {
  return request.delete('/carts', { params: { user_id } })
}

// 更新多个商品的选中状态
export const updateMultipleSelectedAPI = (ids: number[], selected: boolean, user_id: number) => {
  return request.patch('/carts/selected', { ids, selected }, { params: { user_id } })
}

// 批量删除购物车商品
export const deleteMultipleCartItemsAPI = (ids: number[], user_id: number) => {
  return request.delete('/carts/batch', { data: { ids }, params: { user_id } })
}
