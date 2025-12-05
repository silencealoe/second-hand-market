// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  phone?: string
  avatar?: string
  address?: string
}

export interface LoginDto {
  usernameOrEmail: string
  password: string
}

export interface LoginResponseDto {
  access_token: string
  user: User
}

export interface UpdateUserDto {
  email?: string
  phone?: string
  avatar?: string
  address?: string
}

// 商品相关类型
export type ProductStatus = 'on_sale' | 'sold' | 'off_shelf'

export interface Product {
  id: number
  user_id: number
  title: string
  description?: string
  price: number
  original_price?: number
  status: ProductStatus
  category?: string
  images?: string[]
  location?: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface CreateProductDto {
  user_id: number
  title: string
  description?: string
  price: number
  original_price?: number
  status?: ProductStatus
  category?: string
  images?: string[]
  location?: string
}

export interface UpdateProductDto {
  title?: string
  description?: string
  price?: number
  original_price?: number
  status?: ProductStatus
  category?: string
  images?: string[]
  location?: string
}

// 评论相关类型
export interface Comment {
  id: number
  product_id: number
  user_id: number
  parent_id?: number
  content: string
  created_at: string
  updated_at: string
}

export interface CreateCommentDto {
  product_id: number
  user_id: number
  parent_id?: number
  content: string
}

export interface UpdateCommentDto {
  content: string
}

