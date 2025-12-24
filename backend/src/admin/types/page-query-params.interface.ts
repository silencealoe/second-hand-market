/**
 * 分页查询参数接口
 * 用于统一处理分页查询的参数格式
 */
export interface PageQueryParams {
  /** 页码，默认1 */
  page?: number;
  /** 每页数量，默认10 */
  limit?: number;
  /** 搜索关键词 */
  search?: string;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向：asc或desc */
  sortOrder?: 'asc' | 'desc';
}
