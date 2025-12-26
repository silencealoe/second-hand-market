import request from '@/utils/request';

// 核心指标接口参数
interface CoreMetricsParams {
  period?: 'day' | 'week' | 'month';
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
  period?: 'day' | 'week' | 'month';
}

// 分类分布响应
interface CategoryDistributionResponse {
  categories: string[];
  values: number[];
}

// TOP商品接口参数
interface TopProductsParams {
  period?: 'day' | 'week' | 'month';
  limit?: number;
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
export async function getTopProducts(params?: TopProductsParams): Promise<any> {
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

// 导出销售趋势数据到Excel
export async function exportSalesTrend(params?: SalesTrendParams): Promise<Blob> {
  return request('/admin/dashboard/export-sales-trend', {
    method: 'GET',
    params,
    responseType: 'blob', // 指定响应类型为二进制数据
  });
}

// 订单状态分布接口参数
interface OrderStatusDistributionParams {
  period?: 'day' | 'week' | 'month';
}

// 订单状态分布响应项
interface OrderStatusDistributionItem {
  status: string;
  name: string;
  count: number;
  percentage: number;
}

// 订单状态分布响应
type OrderStatusDistributionResponse = OrderStatusDistributionItem[];

// 订单状态分布API
export async function getOrderStatusDistribution(params?: OrderStatusDistributionParams): Promise<OrderStatusDistributionResponse> {
  return request('/admin/dashboard/order-status-distribution', {
    method: 'GET',
    params,
  });
}