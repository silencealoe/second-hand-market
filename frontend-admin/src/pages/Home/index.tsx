import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Button, Table, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { getCoreMetrics, getSalesTrend, getCategoryDistribution, getTopProducts, exportSalesTrend } from '@/services/admin/dashboard';
import { LineChart, PieChart } from '@/components/Charts';
import styles from './index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CoreMetricsData {
  todayOrders: number;
  todayRevenue: number;
  totalUsers: number;
  activeProducts: number; // 后端返回的是activeProducts而不是totalProducts
  orderGrowthRate?: number; // 这些增长率字段后端可能不返回
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

interface TopProduct {
  productId: number;
  productName: string;
  categoryName: string;
  price: number;
  viewCount: number;
  likeCount: number;
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
  const [dimension, setDimension] = useState<'week' | 'day' | 'month'>('day');
  const [distributionType, setDistributionType] = useState<'sales' | 'revenue'>('sales');

  // 获取核心指标数据
  const fetchCoreMetrics = async () => {
    try {
      // 使用与销售趋势相同的参数：period
      const params = {
        period: dimension,
      };
      
      const response = await getCoreMetrics(params);
      setCoreMetrics(response);
    } catch (error) {
      message.error('获取核心指标失败');
      console.error(error);
    }
  };

  // 获取销售趋势数据
  const fetchSalesTrend = async () => {
    try {
      // 注意：后端使用的参数名是period而不是dimension，且不支持hour选项
      // const period = dimension === 'hour' ? 'day' : dimension;
      
      const params = {
        period: dimension
      };
      
      const response = await getSalesTrend(params);
      setSalesTrend(response);
    } catch (error) {
      message.error('获取销售趋势失败');
      console.error(error);
    }
  };

  // 获取分类分布数据
  const fetchCategoryDistribution = async () => {
    try {
      // 注意：后端不接受type参数
      const params = {
        period: dimension,
      };
      
      const response = await getCategoryDistribution(params);
      setCategoryDistribution(response);
    } catch (error) {
      message.error('获取分类分布失败');
      console.error(error);
    }
  };

  // 获取TOP商品数据
  const fetchTopProducts = async () => {
    try {
      // 注意：后端只接受limit和period参数，不接受startDate和endDate
      const params = {
        limit: 10,
        period: dimension,
      };
      
      const response = await getTopProducts(params);
      setTopProducts(response);
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

  // 导出销售趋势数据到Excel
  const handleExportSalesTrend = async () => {
    try {
      // 传递当前的统计周期参数
      const params = {
        period: dimension,
      };
      
      // 调用导出API
      const blob = await exportSalesTrend(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 设置文件名
      const fileName = `销售趋势数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.setAttribute('download', fileName);
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功！');
    } catch (error) {
      message.error('导出失败，请稍后重试');
      console.error('导出销售趋势数据失败：', error);
    }
  };

  // 筛选条件变化时重新加载数据
  useEffect(() => {
    refreshData();
  }, [dateRange, dimension, distributionType]);

  // TOP商品表格列配置
  const topProductColumns = [
    { title: '商品ID', dataIndex: 'productId', key: 'productId' },
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
    { title: '浏览量', dataIndex: 'viewCount', key: 'viewCount' },
    { title: '单价', dataIndex: 'price', key: 'price' },
  ];

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        {/* 筛选区域 */}
        <div className={styles.filterArea} style={{ marginBottom: 24 }}>
          {/* <RangePicker
            value={dateRange ? [dateRange[0] as any, dateRange[1] as any] : undefined}
            onChange={(dates) => setDateRange(dates as [Date, Date] | null)}
            style={{ marginRight: 16 }}
          /> */}
          <Select
            value={dimension}
            onChange={(value) => setDimension(value)}
            style={{ width: 200, marginRight: 16 }}
          >
            <Option value="day">今日（小时）</Option>
            <Option value="week">七日（天）</Option>
            <Option value="month">月度（日）</Option>
          </Select>
          {/* <Select
            value={distributionType}
            onChange={(value) => setDistributionType(value)}
            style={{ width: 120, marginRight: 16 }}
          >
            <Option value="sales">销量占比</Option>
            <Option value="revenue">成交额占比</Option>
          </Select> */}
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
                    {coreMetrics?.orderGrowthRate && Math.abs(coreMetrics.orderGrowthRate)}
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
                    {coreMetrics?.revenueGrowthRate && Math.abs(coreMetrics.revenueGrowthRate)}
                  </span>
                }
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="新增用户数"
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
            <Card>
              <Statistic
                title="新增在售商品数"
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

        {/* 图表区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={16}>
            <Card 
              title="销量趋势" 
              loading={loading}
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
          <Col span={8}>
            <Card title="分类占比" loading={loading}>
              {categoryDistribution && (
                <PieChart
                  title="商品分类占比"
                  data={categoryDistribution.map(item => ({
                    name: item.categoryName,
                    value: item.productCount,
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
            rowKey="productId"
            pagination={false}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default HomePage;
