/**
 * 增强的头部组件
 */

import React from 'react';
import { Layout, Space, Button, Dropdown, Avatar, Badge } from 'antd';
import {
    BellOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '@/hooks/useLayout';
import { useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import DynamicBreadcrumb from './DynamicBreadcrumb';
import { logout } from '@/services/admin/auth';
import { message } from 'antd';
import type { MenuProps } from 'antd';
import './EnhancedHeader.less';

const { Header } = Layout;

interface EnhancedHeaderProps {
    currentUser?: any;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const { layoutState, responsiveState, toggleCollapsed } = useLayout();
    const { isDark } = useTheme();

    // 处理退出登录
    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            navigate('/login');
            message.success('退出登录成功');
        } catch (error) {
            message.error('退出登录失败');
            console.error('退出登录错误:', error);
        }
    };

    // 用户菜单项
    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: (
                <span>
                    <UserOutlined /> 个人资料
                </span>
            ),
            onClick: () => navigate('/profile'),
        },
        {
            key: 'settings',
            label: (
                <span>
                    <SettingOutlined /> 账户设置
                </span>
            ),
            onClick: () => navigate('/settings'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <span>
                    <LogoutOutlined /> 退出登录
                </span>
            ),
            danger: true,
            onClick: handleLogout,
        },
    ];

    // 渲染面包屑导航
    const renderBreadcrumb = () => (
        <DynamicBreadcrumb
            showHome={true}
            showRefresh={false}
            maxItems={4}
        />
    );

    // 渲染用户信息区域
    const renderUserArea = () => {
        if (!currentUser) {
            return (
                <Button type="primary" onClick={() => navigate('/login')}>
                    登录
                </Button>
            );
        }

        return (
            <Space size="middle" className="header-user-area">
                {/* 通知铃铛 */}
                <Badge count={5} size="small">
                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        className="header-action-button"
                        onClick={() => navigate('/notifications')}
                    />
                </Badge>

                {/* 主题切换器 */}
                <ThemeSwitcher size="middle" type="icon" />

                {/* 用户信息下拉菜单 */}
                <Dropdown
                    menu={{ items: userMenuItems }}
                    trigger={['hover', 'click']}
                    placement="bottomRight"
                    arrow
                >
                    <div className="header-user-info">
                        <Avatar
                            src={currentUser?.avatar}
                            icon={<UserOutlined />}
                            size="small"
                        />
                        <span className="user-name">
                            {currentUser?.realName || currentUser?.username}
                        </span>
                    </div>
                </Dropdown>
            </Space>
        );
    };

    return (
        <Header className="enhanced-header">
            <div className="header-left">
                {/* 折叠按钮 - 仅在桌面端显示 */}
                {!responsiveState.isMobile && (
                    <Button
                        type="text"
                        icon={layoutState.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={toggleCollapsed}
                        className="header-collapse-button"
                    />
                )}

                {/* 面包屑导航 */}
                {renderBreadcrumb()}
            </div>

            <div className="header-right">
                {renderUserArea()}
            </div>
        </Header>
    );
};

export default EnhancedHeader;