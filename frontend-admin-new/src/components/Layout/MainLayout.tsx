import React, { ReactNode } from 'react';
import { Layout } from 'antd';
import TopNavigation from './TopNavigation';
import SideNavigation from './SideNavigation';
import './MainLayout.less';

const { Content } = Layout;

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout className="main-layout">
            <SideNavigation />
            <Layout>
                <TopNavigation />
                <Content className="main-content">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;