import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Button, Table, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { getCoreMetrics, getSalesTrend, getCategoryDistribution, getTopProducts } from '@/services/admin/dashboard';
import { LineChart, PieChart } from '@/components/Charts';
import styles from './index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CoreMetricsData {
  todayOrders: number;
  todayRevenue: number;
  totalUsers: number;
  totalProducts: number;
  orderGrowthRate: number;
  revenueGrowthRate: number;
  userGrowthRate: number;
  productGrowthRate: number;
}

interface SalesTrendData {
  labels: string[];
  orderData: number[];
  revenueData: number[];
}

interface CategoryDistributionData {
  categories: string[];
  values: number[];
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  price: number;
}

const HomePage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [coreMetrics, setCoreMetrics] = useState<CoreMetricsData | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendData | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // 筛选条件
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [dimension, setDimension] = useState<'hour' | 'day' | 'month'>('day');
  const [distributionType, setDistributionType] = useState<'sales' | 'revenue'>('sales');

  // 获取核心指标数据
  const fetchCoreMetrics = async () => {
    try {
      const params = dateRange ? {
        startDate: dateRange[0].toISOString().split('T')[0],
        endDate: dateRange[1].toISOString().split('T')[0],
      } : {};
      
      const response = await getCoreMetrics(params);
      if (response.success && response.data) {
        setCoreMetrics(response.data);
      }
    } catch (error) {
      message.error('获取核心指标失败');
      console.error(error);
    }
  };

  // 获取销售趋势数据
  const fetchSalesTrend = async () => {
    try {
      const params = {
        dimension,
        ...(dateRange ? {
          startDate: dateRange[0].toISOString().split('T')[0],
          endDate: dateRange[1].toISOString().split('T')[0],
        } : {}),
      };
      
      const response = await getSalesTrend(params);
      if (response.success && response.data) {
        setSalesTrend(response.data);
      }
    } catch (error) {
      message.error('获取销售趋势失败');
      console.error(error);
    }
  };

  // 获取分类分布数据
  const fetchCategoryDistribution = async () => {
    try {
      const params = {
        type: distributionType,
        ...(dateRange ? {
          startDate: dateRange[0].toISOString().split('T')[0],
          endDate: dateRange[1].toISOString().split('T')[0],
        } : {}),
      };
      
      const response = await getCategoryDistribution(params);
      if (response.success && response.data) {
        setCategoryDistribution(response.data);
      }
    } catch (error) {
      message.error('获取分类分布失败');
      console.error(error);
    }
  };

  // 获取TOP商品数据
  const fetchTopProducts = async () => {
    try {
      const params = dateRange ? {
        startDate: dateRange[0].toISOString().split('T')[0],
        endDate: dateRange[1].toISOString().split('T')[0],
        limit: 10,
      } : {};
      
      const response = await getTopProducts(params);
      if (response.success && response.data) {
        setTopProducts(response.data);
      }
    } catch (error) {
      message.error('获取TOP商品失败');
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
        fetchTopProducts(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    refreshData();
  }, []);

  // 筛选条件变化时重新加载数据
  useEffect(() => {
    refreshData();
  }, [dateRange, dimension, distributionType]);

  // TOP商品表格列配置
  const topProductColumns = [
    { title: '商品ID', dataIndex: 'id', key: 'id' },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '销量', dataIndex: 'sales', key: 'sales' },
    { title: '成交额', dataIndex: 'revenue', key: 'revenue' },
    { title: '单价', dataIndex: 'price', key: 'price' },
  ];

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        {/* 筛选区域 */}
        <div className={styles.filterArea}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Date, Date] | null)}
            style={{ marginRight: 16 }}
          />
          <Select
            value={dimension}
            onChange={(value) => setDimension(value)}
            style={{ width: 120, marginRight: 16 }}
          >
            <Option value="hour">今日（小时）</Option>
            <Option value="day">七日（天）</Option>
            <Option value="month">月度（日）</Option>
          </Select>
          <Select
            value={distributionType}
            onChange={(value) => setDistributionType(value)}
            style={{ width: 120, marginRight: 16 }}
          >
            <Option value="sales">销量占比</Option>
            <Option value="revenue">成交额占比</Option>
          </Select>
          <Button type="primary" onClick={refreshData} loading={loading}>
            刷新数据
          </Button>
        </div>

        {/* 核心指标卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日订单数"
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
                    {coreMetrics?.orderGrowthRate && Math.abs(coreMetrics.orderGrowthRate)}%
                  </span>
                }
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日成交额"
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
                    {coreMetrics?.revenueGrowthRate && Math.abs(coreMetrics.revenueGrowthRate)}%
                  </span>
                }
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="累计用户数"
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
                    {coreMetrics?.userGrowthRate && Math.abs(coreMetrics.userGrowthRate)}%
                  </span>
                }
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="在售商品数"
                value={coreMetrics?.totalProducts || 0}
                suffix={
                  <span>
                    {coreMetrics?.productGrowthRate && (
                      coreMetrics.productGrowthRate > 0 ? (
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                      )
                    )}
                    {coreMetrics?.productGrowthRate && Math.abs(coreMetrics.productGrowthRate)}%
                  </span>
                }
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={16}>
            <Card title="销量趋势" loading={loading}>
              {salesTrend && (
                <LineChart
                  title="销量与成交额趋势"
                  xAxisData={salesTrend.labels}
                  series={[
                    {
                      name: '订单数',
                      data: salesTrend.orderData,
                      color: '#52c41a',
                    },
                    {
                      name: '成交额',
                      data: salesTrend.revenueData,
                      color: '#1890ff',
                      yAxisIndex: 1,
                    },
                  ]}
                  yAxis={[
                    { name: '订单数' },
                    { name: '成交额(元)' },
                  ]}
                />
              )}
            </Card>
          </Col>
          <Col span={8}>
            <Card title="分类占比" loading={loading}>
              {categoryDistribution && (
                <PieChart
                  title={`${distributionType === 'sales' ? '销量' : '成交额'}分类占比`}
                  data={categoryDistribution.categories.map((category, index) => ({
                    name: category,
                    value: categoryDistribution.values[index],
                  }))}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* TOP商品区域 */}
        <Card title="销量TOP10商品" loading={loading}>
          <Table
            columns={topProductColumns}
            dataSource={topProducts}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default HomePage;
