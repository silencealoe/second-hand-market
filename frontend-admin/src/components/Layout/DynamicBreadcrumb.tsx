/**
 * 动态面包屑导航组件
 */

import React, { useEffect } from 'react';
import { Breadcrumb, Button } from 'antd';
import {
    HomeOutlined,
    ReloadOutlined,
    DashboardOutlined,
    UserOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '@/hooks/useLayout';
import breadcrumbService from '@/services/breadcrumb';
import { BreadcrumbItem } from '@/types/layout';
import './DynamicBreadcrumb.less';

interface DynamicBreadcrumbProps {
    showHome?: boolean;
    showRefresh?: boolean;
    maxItems?: number;
    separator?: string;
    className?: string;
}

const DynamicBreadcrumb: React.FC<DynamicBreadcrumbProps> = ({
    showHome = true,
    showRefresh = false,
    maxItems = 5,
    separator = '/',
    className = '',
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { layoutState, setBreadcrumbs } = useLayout();

    // 图标映射
    const getIcon = (path?: string) => {
        if (!path) return null;
        const iconMap: Record<string, React.ReactNode> = {
            '/home': <DashboardOutlined />,
            '/users': <UserOutlined />,
            '/products': <ShoppingOutlined />,
            '/analytics': <BarChartOutlined />,
            '/settings': <SettingOutlined />,
        };
        return iconMap[path] || <HomeOutlined />;
    };

    // 处理面包屑点击
    const handleBreadcrumbClick = (path: string) => {
        if (path && path !== location.pathname) {
            navigate(path);
        }
    };

    // 处理刷新按钮点击
    const handleRefresh = () => {
        window.location.reload();
    };

    // 根据路径更新面包屑
    useEffect(() => {
        const breadcrumbs = breadcrumbService.generateBreadcrumbs(location.pathname);
        setBreadcrumbs(breadcrumbs);
    }, [location.pathname, setBreadcrumbs]);

    // 处理面包屑项目过多的情况
    const getDisplayBreadcrumbs = (items: BreadcrumbItem[]): BreadcrumbItem[] => {
        if (items.length <= maxItems) {
            return items;
        }

        // 保留第一个和最后两个，中间用省略号
        const first = items[0];
        const lastTwo = items.slice(-2);

        return [
            first,
            { title: '...', path: undefined },
            ...lastTwo,
        ];
    };

    // 渲染面包屑项
    const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
        const isClickable = item.path && item.path !== location.pathname;
        const isEllipsis = item.title === '...';

        if (isEllipsis) {
            return (
                <Breadcrumb.Item key={`ellipsis-${index}`}>
                    <span className="breadcrumb-ellipsis">...</span>
                </Breadcrumb.Item>
            );
        }

        return (
            <Breadcrumb.Item key={item.path || index}>
                <div className="breadcrumb-item">
                    {getIcon(item.path) && (
                        <span className="breadcrumb-icon">{getIcon(item.path)}</span>
                    )}
                    {isClickable ? (
                        <a
                            className="breadcrumb-link"
                            onClick={() => handleBreadcrumbClick(item.path!)}
                        >
                            {item.title}
                        </a>
                    ) : (
                        <span className="breadcrumb-current">{item.title}</span>
                    )}
                </div>
            </Breadcrumb.Item>
        );
    };

    const displayBreadcrumbs = getDisplayBreadcrumbs(layoutState.breadcrumbs);

    if (displayBreadcrumbs.length === 0) {
        return null;
    }

    return (
        <div className={`dynamic-breadcrumb ${className}`}>
            <div className="breadcrumb-content">
                {showHome && location.pathname !== '/home' && (
                    <Button
                        type="text"
                        icon={<HomeOutlined />}
                        onClick={() => handleBreadcrumbClick('/home')}
                        className="breadcrumb-home-button"
                        size="small"
                    />
                )}

                <Breadcrumb
                    separator={separator}
                    className="breadcrumb-nav"
                >
                    {displayBreadcrumbs.map(renderBreadcrumbItem)}
                </Breadcrumb>
            </div>

            {showRefresh && (
                <div className="breadcrumb-actions">
                    <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        className="breadcrumb-refresh-button"
                        size="small"
                        title="刷新页面"
                    />
                </div>
            )}
        </div>
    );
};

export default DynamicBreadcrumb;