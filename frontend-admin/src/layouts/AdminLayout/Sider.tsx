import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const Sider: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/home',
      label: <Link to="/home">数据仪表盘</Link>,
      icon: <DashboardOutlined />,
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[currentPath]}
      items={menuItems}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default Sider;
