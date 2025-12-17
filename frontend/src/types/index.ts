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
  stock: number
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
  stock?: number
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
  stock?: number
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

// 订单相关类型
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface Order {
  id: number
  order_number: string
  user_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  total_price: number
  status: OrderStatus
  shipping_address?: string
  payment_method?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface CreateOrderDto {
  user_id: number
  product_id: number
  quantity: number
  shipping_address?: string
  payment_method?: string
}

export interface UpdateCommentDto {
  content: string
}

// 购物车相关类型
export interface CartItem {
  id: number
  product: Product
  quantity: number
  selected: boolean
}

export interface CartState {
  items: CartItem[]
}

