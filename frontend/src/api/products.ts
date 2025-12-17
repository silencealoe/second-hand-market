import request from './request'
import type { Product, CreateProductDto, UpdateProductDto, ProductStatus } from '@/types'

// 创建商品
export const createProduct = (data: CreateProductDto) => {
  return request.post<Product>('/products', data)
}

// 获取商品列表
export const getProducts = (params?: {
  status?: ProductStatus
  category?: string
  user_id?: string
  page?: number
  limit?: number
  title?: string
  min_price?: number
  max_price?: number
  location?: string
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}) => {
  return request.get<{
    data: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>('/products', { params })
}

// 根据ID获取商品详情
export const getProductById = (id: number) => {
  return request.get<Product>(`/products/${id}`)
}

// 更新商品信息
export const updateProduct = (id: number, data: UpdateProductDto) => {
  return request.patch<Product>(`/products/${id}`, data)
}

// 删除商品
export const deleteProduct = (id: number) => {
  return request.delete(`/products/${id}`)
}

