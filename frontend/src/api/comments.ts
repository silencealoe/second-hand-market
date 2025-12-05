import request from './request'
import type { Comment, CreateCommentDto, UpdateCommentDto } from '@/types'

// 创建评论
export const createComment = (data: CreateCommentDto) => {
  return request.post<Comment>('/comments', data)
}

// 获取评论列表
export const getComments = (params?: { product_id?: string }) => {
  return request.get<Comment[]>('/comments', { params })
}

// 根据ID获取评论详情
export const getCommentById = (id: number) => {
  return request.get<Comment>(`/comments/${id}`)
}

// 更新评论
export const updateComment = (id: number, data: UpdateCommentDto) => {
  return request.patch<Comment>(`/comments/${id}`, data)
}

// 删除评论
export const deleteComment = (id: number) => {
  return request.delete(`/comments/${id}`)
}

