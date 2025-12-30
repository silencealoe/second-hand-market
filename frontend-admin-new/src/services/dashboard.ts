import { apiRequest, exportRequest } from './request';

// 获取核心指标数据
export const getCoreMetrics = async (params: { period: string }) => {
    return apiRequest.get('/admin/dashboard/core-metrics', { params });
};

// 获取销售趋势数据
export const getSalesTrend = async (params: { period: string }) => {
    return apiRequest.get('/admin/dashboard/sales-trend', { params });
};

// 获取分类分布数据
export const getCategoryDistribution = async (params: { period: string }) => {
    return apiRequest.get('/admin/dashboard/category-distribution', { params });
};

// 获取订单状态分布数据
export const getOrderStatusDistribution = async (params: { period: string }) => {
    return apiRequest.get('/admin/dashboard/order-status-distribution', { params });
};

// 获取TOP商品数据
export const getTopProducts = async (params: { limit: number; period: string }) => {
    return apiRequest.get('/admin/dashboard/top-products', { params });
};

// 导出销售趋势数据 - 使用专门的导出实例
export const exportSalesTrend = async (params: { period: string }) => {
    return exportRequest.get('/admin/dashboard/export-sales-trend', { params });
};