import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select, Button, Table, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import {
    getCoreMetrics,
    getSalesTrend,
    getCategoryDistribution,
    getTopProducts,
    exportSalesTrend,
    getOrderStatusDistribution
} from '@/services';
import { LineChart, PieChart, BarChart } from '@/components/Charts';
import './index.less';

const { Option } = Select;

interface CoreMetricsData {
    todayOrders: number;
    todayRevenue: number;
    totalUsers: number;
    activeProducts: number;
    orderGrowthRate?: number;
    revenueGrowthRate?: number;
    userGrowthRate?: number;
    productGrowthRate?: number;
}

type SalesTrendData = {
    date: string;
    orderCount: number;
    salesCount: number;
    revenue: number;
}[]

type CategoryDistributionData = {
    categoryName: string;
    productCount: number;
    percentage: number;
}[]

type OrderStatusDistributionData = {
    status: string;
    name: string;
    count: number;
    percentage: number;
}[]

interface TopProduct {
    productId: number;
    productName: string;
    categoryName: string;
    price: number;
    images: string[];
    orderCount: number;
    salesCount: number;
    totalRevenue: number;
}

const Dashboard: React.FC = () => {
    // 状态管理
    const [loading, setLoading] = useState(true);
    const [coreMetrics, setCoreMetrics] = useState<CoreMetricsData | null>(null);
    const [salesTrend, setSalesTrend] = useState<SalesTrendData | null>(null);
    const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionData | null>(null);
    const [orderStatusDistribution, setOrderStatusDistribution] = useState<OrderStatusDistributionData | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 筛选条件
    const [dimension, setDimension] = useState<'week' | 'day' | 'month'>('day');

    // 获取核心指标数据
    const fetchCoreMetrics = async () => {
        try {
            const params = { period: dimension };
            const response = await getCoreMetrics(params);
            setCoreMetrics(response.data);
        } catch (error) {
            message.error('获取核心指标失败');
            console.error(error);
        }
    };

    // 获取销售趋势数据
    const fetchSalesTrend = async () => {
        try {
            const params = { period: dimension };
            const response = await getSalesTrend(params);
            console.log('tr', response);
            setSalesTrend(response.data);
        } catch (error) {
            message.error('获取销售趋势失败');
            console.error(error);
        }
    };

    // 获取分类分布数据
    const fetchCategoryDistribution = async () => {
        try {
            const params = { period: dimension };
            const response = await getCategoryDistribution(params);
            setCategoryDistribution(response.data);
        } catch (error) {
            message.error('获取分类分布失败');
            console.error(error);
        }
    };

    // 获取TOP商品数据
    const fetchTopProducts = async () => {
        try {
            const params = { limit: 10, period: dimension };
            const response = await getTopProducts(params);
            setTopProducts(response.data);
        } catch (error) {
            message.error('获取TOP商品失败');
            console.error(error);
        }
    };

    // 获取订单状态分布数据
    const fetchOrderStatusDistribution = async () => {
        try {
            const params = { period: dimension };
            const response = await getOrderStatusDistribution(params);
            setOrderStatusDistribution(response.data);
        } catch (error) {
            message.error('获取订单状态分布失败');
            console.error(error);
        }
    };

    // 刷新所有数据
    const refreshData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCoreMetrics(),
                fetchSalesTrend(),
                fetchCategoryDistribution(),
                fetchOrderStatusDistribution(),
                fetchTopProducts(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载数据 - 只在组件挂载时执行一次
    useEffect(() => {
        refreshData();
    }, []);

    // 筛选条件变化时重新加载数据 - 排除初始渲染
    useEffect(() => {
        // 只有在组件已经挂载后，dimension 变化时才重新加载数据
        // 避免与初始加载重复
        if (coreMetrics !== null || salesTrend !== null) {
            refreshData();
        }
    }, [dimension]);

    // 导出销售趋势数据到Excel
    const handleExportSalesTrend = async () => {
        try {
            const params = { period: dimension };
            const blob = await exportSalesTrend(params);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const fileName = `销售趋势数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.setAttribute('download', fileName);

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success('导出成功！');
        } catch (error) {
            message.error('导出失败，请稍后重试');
            console.error('导出销售趋势数据失败：', error);
        }
    };

    // TOP商品表格列配置
    const topProductColumns = [
        { title: '商品ID', dataIndex: 'productId', key: 'productId' },
        {
            title: '商品图片',
            dataIndex: 'images',
            key: 'images',
            render: (images: string[]) => {
                if (images && images.length > 0) {
                    return <img src={images[0]} alt="商品缩略图" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                }
                return '无图片';
            }
        },
        { title: '商品名称', dataIndex: 'productName', key: 'productName' },
        { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
        { title: '单价', dataIndex: 'price', key: 'price' },
        { title: '订单数量', dataIndex: 'orderCount', key: 'orderCount' },
        { title: '销量', dataIndex: 'salesCount', key: 'salesCount' },
        { title: '总销售额', dataIndex: 'totalRevenue', key: 'totalRevenue' },
    ];

    // 根据dimension获取时间范围标题
    const getTimeRangeTitle = (baseTitle: string) => {
        const dimensionMap: Record<string, string> = {
            day: '今日',
            week: '本周',
            month: '本月'
        };
        return `${dimensionMap[dimension]}${baseTitle}`;
    };

    return (
        <div className="dashboard-container">
            {/* 筛选区域 */}
            <div className="filter-area">
                <Select
                    value={dimension}
                    onChange={(value) => setDimension(value)}
                    style={{ width: 200, marginRight: 16 }}
                >
                    <Option value="day">今日（小时）</Option>
                    <Option value="week">七日（天）</Option>
                    <Option value="month">月度（日）</Option>
                </Select>
                <Button type="primary" onClick={refreshData} loading={loading}>
                    刷新数据
                </Button>
            </div>

            {/* 核心指标卡片 */}
            <Row gutter={[16, 16]} className="metrics-cards">
                <Col span={6}>
                    <Card className="metric-card">
                        <Statistic
                            title={getTimeRangeTitle('订单数')}
                            value={coreMetrics?.todayOrders || 0}
                            suffix={
                                <span>
                                    {coreMetrics?.orderGrowthRate && (
                                        coreMetrics.orderGrowthRate > 0 ? (
                                            <ArrowUpOutlined style={{ color: '#52c41a' }} />
                                        ) : (
                                            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                                        )
                                    )}
                                    {coreMetrics?.orderGrowthRate && Math.abs(coreMetrics.orderGrowthRate)}
                                </span>
                            }
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="metric-card">
                        <Statistic
                            title={getTimeRangeTitle('成交额')}
                            value={coreMetrics?.todayRevenue || 0}
                            precision={2}
                            prefix="¥"
                            suffix={
                                <span>
                                    {coreMetrics?.revenueGrowthRate && (
                                        coreMetrics.revenueGrowthRate > 0 ? (
                                            <ArrowUpOutlined style={{ color: '#52c41a' }} />
                                        ) : (
                                            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                                        )
                                    )}
                                    {coreMetrics?.revenueGrowthRate && Math.abs(coreMetrics.revenueGrowthRate)}
                                </span>
                            }
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="metric-card">
                        <Statistic
                            title={getTimeRangeTitle('新增用户数')}
                            value={coreMetrics?.totalUsers || 0}
                            suffix={
                                <span>
                                    {coreMetrics?.userGrowthRate && (
                                        coreMetrics.userGrowthRate > 0 ? (
                                            <ArrowUpOutlined style={{ color: '#52c41a' }} />
                                        ) : (
                                            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                                        )
                                    )}
                                    {coreMetrics?.userGrowthRate && Math.abs(coreMetrics.userGrowthRate)}
                                </span>
                            }
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="metric-card">
                        <Statistic
                            title={getTimeRangeTitle('新增在售商品数')}
                            value={coreMetrics?.activeProducts || 0}
                            suffix={
                                <span>
                                    {coreMetrics?.productGrowthRate && (
                                        coreMetrics.productGrowthRate > 0 ? (
                                            <ArrowUpOutlined style={{ color: '#52c41a' }} />
                                        ) : (
                                            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                                        )
                                    )}
                                    {coreMetrics?.productGrowthRate && Math.abs(coreMetrics.productGrowthRate)}
                                </span>
                            }
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 销量趋势图表 */}
            <Row gutter={[16, 16]} className="charts-section">
                <Col span={24}>
                    <Card
                        title="销量趋势"
                        loading={loading}
                        className="chart-card"
                        extra={
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExportSalesTrend}
                            >
                                导出数据
                            </Button>
                        }
                    >
                        {salesTrend && (
                            <LineChart
                                title="销量与成交额趋势"
                                xAxisData={salesTrend.map(item => item.date)}
                                series={[
                                    {
                                        name: '订单数',
                                        data: salesTrend.map(item => item.orderCount),
                                        color: '#52c41a',
                                    },
                                    {
                                        name: '销量',
                                        data: salesTrend.map(item => item.salesCount),
                                        color: '#faad14',
                                    },
                                    {
                                        name: '成交额',
                                        data: salesTrend.map(item => item.revenue),
                                        color: '#1890ff',
                                        yAxisIndex: 1,
                                    },
                                ]}
                                yAxis={[
                                    { name: '数量' },
                                    { name: '成交额(元)' },
                                ]}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* 环形图表 */}
            <Row gutter={[16, 16]} className="charts-section">
                <Col span={12}>
                    <Card title="分类占比" loading={loading} className="chart-card">
                        {categoryDistribution && (
                            <BarChart
                                title="商品分类统计"
                                data={categoryDistribution.map(item => ({
                                    name: item.categoryName,
                                    value: item.productCount,
                                }))}
                                height="300px"
                                color="#ff6b35"
                            />
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="支付与取消订单占比" loading={loading} className="chart-card">
                        {orderStatusDistribution && (
                            <PieChart
                                title=""
                                data={orderStatusDistribution.map(item => ({
                                    name: item.name,
                                    value: item.count,
                                }))}
                                colors={['#52c41a', '#ff4d4f']}
                                height="300px"
                                showLabelLine={true}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* TOP商品区域 */}
            <Card title="销量TOP10商品" loading={loading} className="table-card">
                <Table
                    columns={topProductColumns}
                    dataSource={topProducts}
                    rowKey="productId"
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default Dashboard;