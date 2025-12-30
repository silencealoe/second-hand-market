/**
 * 增强的ProLayout组件
 */

import React, { useEffect } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useLayout } from '@/hooks/useLayout';
import { useTheme } from '@/hooks/useTheme';
import ResponsiveSider from './ResponsiveSider';
import EnhancedHeader from './EnhancedHeader';
import { MenuItem, BreadcrumbItem } from '@/types/layout';
import {
    DashboardOutlined,
    UserOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import './EnhancedProLayout.less';

const { Content } = Layout;

interface EnhancedProLayoutProps {
    currentUser?: any;
    children?: React.ReactNode;
}

const EnhancedProLayout: React.FC<EnhancedProLayoutProps> = ({ currentUser, children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { layoutState, responsiveState, setBreadcrumbs, setActiveMenuKeys } = useLayout();
    const { isDark } = useTheme();

    // 菜单配置
    const menuItems: MenuItem[] = [
        {
            key: '/home',
            label: '数据仪表板',
            icon: <DashboardOutlined />,
            path: '/home',
        },
        {
            key: '/users',
            label: '用户管理',
            icon: <UserOutlined />,
            path: '/users',
        },
        {
            key: '/products',
            label: '商品管理',
            icon: <ShoppingOutlined />,
            path: '/products',
        },
        {
            key: '/analytics',
            label: '数据分析',
            icon: <BarChartOutlined />,
            path: '/analytics',
        },
        {
            key: '/settings',
            label: '系统设置',
            icon: <SettingOutlined />,
            path: '/settings',
        },
    ];

    // 根据路径生成面包屑
    const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
        const breadcrumbs: BreadcrumbItem[] = [
            { title: '首页', path: '/home', icon: <DashboardOutlined /> }
        ];

        const pathSegments = pathname.split('/').filter(Boolean);

        if (pathSegments.length > 0) {
            const currentMenu = menuItems.find(item => item.path === pathname);
            if (currentMenu && pathname !== '/home') {
                breadcrumbs.push({
                    title: currentMenu.label,
                    path: currentMenu.path,
                    icon: currentMenu.icon,
                });
            }
        }

        return breadcrumbs;
    };

    // 监听路由变化，更新面包屑和活动菜单
    useEffect(() => {
        const currentPath = location.pathname;

        // 更新面包屑
        const breadcrumbs = generateBreadcrumbs(currentPath);
        setBreadcrumbs(breadcrumbs);

        // 更新活动菜单
        const activeKeys = menuItems
            .filter(item => item.path && currentPath.startsWith(item.path))
            .map(item => item.key);

        if (activeKeys.length > 0) {
            setActiveMenuKeys(activeKeys);
        }
    }, [location.pathname]);

    // 计算内容区域的左边距
    const getContentMarginLeft = () => {
        if (responsiveState.isMobile) {
            return 0;
        }
        return layoutState.collapsed ? 64 : layoutState.config.siderWidth;
    };

    return (
        <div className="enhanced-pro-layout">
            {/* 响应式侧边栏 */}
            <ResponsiveSider />

            {/* 主要布局区域 */}
            <Layout
                className="layout-main"
                style={{
                    marginLeft: getContentMarginLeft(),
                    transition: 'margin-left 0.3s ease',
                }}
            >
                {/* 增强的头部 */}
                <EnhancedHeader currentUser={currentUser} />

                {/* 内容区域 */}
                <Content className="layout-content">
                    <div className="content-wrapper">
                        {children || <Outlet />}
                    </div>
                </Content>
            </Layout>
        </div>
    );
};

export default EnhancedProLayout;