import request from '@/utils/request';

// 核心指标接口参数
interface CoreMetricsParams {
  startDate?: string;
  endDate?: string;
}

// 核心指标响应
interface CoreMetricsResponse {
  todayOrders: number;
  todayRevenue: number;
  totalUsers: number;
  totalProducts: number;
  orderGrowthRate: number;
  revenueGrowthRate: number;
  userGrowthRate: number;
  productGrowthRate: number;
}

// 销售趋势接口参数
interface SalesTrendParams {
  period?: 'day' | 'week' | 'month';
}

// 销售趋势响应数据项
interface SalesTrendItem {
  date: string;
  orderCount: number;
  salesCount: number;
  revenue: number;
}

// 销售趋势响应
type SalesTrendResponse = SalesTrendItem[];

// 分类分布接口参数
interface CategoryDistributionParams {
  // 后端不接受参数
}

// 分类分布响应
interface CategoryDistributionResponse {
  categories: string[];
  values: number[];
}

// 核心指标API
export async function getCoreMetrics(params?: CoreMetricsParams): Promise<CoreMetricsResponse> {
  return request('/admin/dashboard/core-metrics', {
    method: 'GET',
    params,
  });
}

// 销售趋势API
export async function getSalesTrend(params?: SalesTrendParams): Promise<SalesTrendResponse> {
  return request('/admin/dashboard/sales-trend', {
    method: 'GET',
    params,
  });
}

// 分类分布API
export async function getCategoryDistribution(params?: CategoryDistributionParams): Promise<CategoryDistributionResponse> {
  return request('/admin/dashboard/category-distribution', {
    method: 'GET',
    params,
  });
}

// TOP商品API
export async function getTopProducts(params?: {
  limit?: number;
}): Promise<any> {
  return request('/admin/dashboard/top-products', {
    method: 'GET',
    params,
  });
}

// 用户增长API
export async function getUserGrowth(params?: {
  startDate?: string;
  endDate?: string;
  dimension?: 'day' | 'week' | 'month';
}): Promise<any> {
  return request('/admin/dashboard/user-growth', {
    method: 'GET',
    params,
  });
}

// 实时数据API
export async function getRealTimeData(): Promise<any> {
  return request('/admin/dashboard/real-time-data', {
    method: 'GET',
  });
}