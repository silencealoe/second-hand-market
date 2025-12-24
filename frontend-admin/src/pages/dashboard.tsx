import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';

// 核心数据卡片组件
const DataCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}> = ({ title, value, icon, color, loading = false }) => (
  <Card loading={loading}>
    <Statistic
      title={title}
      value={value}
      prefix={icon}
      valueStyle={{ color }}
    />
  </Card>
);

const Dashboard: React.FC = () => {
  // 图表引用
  const categoryChartRef = useRef<HTMLDivElement>(null);
  const salesChartRef = useRef<HTMLDivElement>(null);
  
  // 图表实例
  const categoryChartInstance = useRef<echarts.ECharts | null>(null);
  const salesChartInstance = useRef<echarts.ECharts | null>(null);

  // 模拟数据
  const [dashboardData, setDashboardData] = React.useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    loading: true,
  });

  // 初始化数据
  useEffect(() => {
    // 模拟异步获取数据
    const fetchData = async () => {
      try {
        // 实际项目中应该调用后端API获取真实数据
        // const response = await request.get('/api/admin/dashboard');
        // setDashboardData(response.data);
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        setDashboardData({
          totalUsers: 1234,
          totalProducts: 5678,
          totalOrders: 3456,
          totalSales: '¥ 123,456',
          loading: false,
        });
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  // 初始化图表
  useEffect(() => {
    if (categoryChartRef.current && !categoryChartInstance.current) {
      // 初始化分类统计图表
      categoryChartInstance.current = echarts.init(categoryChartRef.current);
      const option = {
        title: {
          text: '商品分类统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '商品数量',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: '数码产品' },
              { value: 735, name: '服装鞋包' },
              { value: 580, name: '家居用品' },
              { value: 484, name: '图书音像' },
              { value: 300, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      categoryChartInstance.current.setOption(option);
    }

    if (salesChartRef.current && !salesChartInstance.current) {
      // 初始化销售额图表
      salesChartInstance.current = echarts.init(salesChartRef.current);
      const option = {
        title: {
          text: '月度销售额',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['销售额']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '销售额',
            type: 'line',
            stack: 'Total',
            data: [12000, 19000, 36000, 28000, 45000, 52000, 68000, 75000, 88000, 102000, 118000, 135000]
          }
        ]
      };
      salesChartInstance.current.setOption(option);
    }

    // 响应窗口大小变化
    const handleResize = () => {
      categoryChartInstance.current?.resize();
      salesChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      categoryChartInstance.current?.dispose();
      salesChartInstance.current?.dispose();
      categoryChartInstance.current = null;
      salesChartInstance.current = null;
    };
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据面板</h2>
      
      {/* 核心数据模块 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <DataCard
            title="总用户数"
            value={dashboardData.totalUsers}
            icon={<UserOutlined />}
            color="#1890ff"
            loading={dashboardData.loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard
            title="总商品数"
            value={dashboardData.totalProducts}
            icon={<ShoppingCartOutlined />}
            color="#52c41a"
            loading={dashboardData.loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard
            title="总订单数"
            value={dashboardData.totalOrders}
            icon={<BarChartOutlined />}
            color="#fa8c16"
            loading={dashboardData.loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DataCard
            title="总销售额"
            value={dashboardData.totalSales}
            icon={<DollarOutlined />}
            color="#f5222d"
            loading={dashboardData.loading}
          />
        </Col>
      </Row>

      {/* 图表模块 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="商品分类分布">
            <div ref={categoryChartRef} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="月度销售额趋势">
            <div ref={salesChartRef} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
