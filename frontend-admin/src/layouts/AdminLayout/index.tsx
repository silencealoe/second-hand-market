import React from 'react';
import { Layout } from 'antd';
import Header from './Header';
import Sider from './Sider';
import Content from './Content';
import { useModel } from 'umi';

const { Header: AntHeader, Sider: AntSider, Content: AntContent } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  // 从全局状态中获取当前用户信息
  const { userInfo } = useModel('global');
  const currentUser = userInfo;
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AntSider breakpoint="lg" collapsedWidth="0" style={{ backgroundColor: '#001529' }}>
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px' }} />
        <Sider />
      </AntSider>
      <Layout>
        <AntHeader style={{ background: '#001529', padding: 0 }}>
          <Header currentUser={currentUser} />
        </AntHeader>
        <AntContent style={{ margin: 0, background: '#f0f2f5' }}>
          <Content title={title}>
            {children}
          </Content>
        </AntContent>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
