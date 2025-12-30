/**
 * 响应式侧边栏组件
 */

import React, { useState, useEffect } from 'react';
import { Layout, Button, Drawer } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { useLayout } from '@/hooks/useLayout';
import { useNavigation } from '@/hooks/useNavigation';
import EnhancedMenu from './EnhancedMenu';
import './ResponsiveSider.less';

const { Sider } = Layout;

interface ResponsiveSiderProps {
    logo?: string;
    title?: string;
}

const ResponsiveSider: React.FC<ResponsiveSiderProps> = ({
    logo = 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    title = '二手商城管理系统'
}) => {
    const location = useLocation();
    const { layoutState, responsiveState, toggleCollapsed } = useLayout();
    const { setActiveByPath } = useNavigation();
    const [drawerVisible, setDrawerVisible] = useState(false);

    // 监听路由变化，更新导航状态
    useEffect(() => {
        setActiveByPath(location.pathname);
    }, [location.pathname, setActiveByPath]);

    // 处理菜单点击（移动端关闭抽屉）
    const handleMobileMenuClick = () => {
        if (responsiveState.isMobile) {
            setDrawerVisible(false);
        }
    };

    // 处理折叠按钮点击
    const handleToggleCollapsed = () => {
        if (responsiveState.isMobile) {
            setDrawerVisible(!drawerVisible);
        } else {
            toggleCollapsed();
        }
    };

    // 根据当前路径设置活动菜单
    useEffect(() => {
        setActiveByPath(location.pathname);
    }, [location.pathname, setActiveByPath]);

    // 渲染Logo区域
    const renderLogo = () => (
        <div className="sider-logo">
            <img src={logo} alt="logo" />
            {!layoutState.collapsed && !responsiveState.isMobile && (
                <h1>{title}</h1>
            )}
        </div>
    );

    // 渲染菜单
    const renderMenu = () => (
        <div onClick={handleMobileMenuClick}>
            <EnhancedMenu
                mode="inline"
                theme="dark"
                className="sider-menu"
                inlineCollapsed={layoutState.collapsed && !responsiveState.isMobile}
            />
        </div>
    );

    // 渲染折叠按钮
    const renderCollapseButton = () => (
        <Button
            type="text"
            icon={layoutState.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleToggleCollapsed}
            className="collapse-button"
            style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                color: '#fff',
            }}
        />
    );

    // 移动端渲染
    if (responsiveState.isMobile) {
        return (
            <>
                {/* 移动端触发按钮 */}
                <Button
                    type="text"
                    icon={<MenuUnfoldOutlined />}
                    onClick={() => setDrawerVisible(true)}
                    className="mobile-menu-trigger"
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1001,
                        fontSize: '16px',
                        color: '#fff',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        border: 'none',
                    }}
                />

                {/* 移动端抽屉菜单 */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={logo} alt="logo" style={{ width: 24, height: 24, marginRight: 8 }} />
                            {title}
                        </div>
                    }
                    placement="left"
                    closable={true}
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    bodyStyle={{ padding: 0 }}
                    width={280}
                    className="mobile-sider-drawer"
                >
                    {renderMenu()}
                </Drawer>
            </>
        );
    }

    // 桌面端渲染
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={layoutState.collapsed}
            width={layoutState.config.siderWidth}
            collapsedWidth={64}
            className="responsive-sider"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
            }}
        >
            {renderLogo()}
            {renderMenu()}

            {/* 折叠按钮 */}
            <div className="sider-footer">
                {renderCollapseButton()}
            </div>
        </Sider>
    );
};

export default ResponsiveSider;