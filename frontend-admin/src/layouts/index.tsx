import React from 'react';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import { DashboardOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// 菜单数据
const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '数据面板',
  },
];

// 用户下拉菜单
const userMenu = (
  <Menu
    items={[
      {
        key: 'profile',
        label: '个人信息',
        icon: <UserOutlined />,
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
      },
    ]}
    onClick={(e) => {
      if (e.key === 'logout') {
        // 退出登录，清除token并跳转登录页面
        localStorage.removeItem('token');
        history.push('/login');
        message.success('已退出登录');
      }
    }}
  />
);

const MainLayout: React.FC = () => {
  // 当前选中的菜单
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(['/']);

  // 处理菜单点击
  const handleMenuClick = (e: { key: string }) => {
    setSelectedKeys([e.key]);
    history.push(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        {/* 头部 */}
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 12 }}>管理员</span>
            </div>
          </Dropdown>
        </Header>
        {/* 内容区域 */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
