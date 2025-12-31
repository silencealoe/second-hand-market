import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import './SideNavigation.less';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const SideNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems: MenuItem[] = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: '首页',
            onClick: () => navigate('/dashboard'),
        },
        {
            key: 'system',
            icon: <SettingOutlined />,
            label: '系统管理',
            children: [
                {
                    key: '/system/users',
                    icon: <UserOutlined />,
                    label: '用户管理',
                    onClick: () => navigate('/system/users'),
                },
                {
                    key: '/system/settings',
                    icon: <TeamOutlined />,
                    label: '系统设置',
                    onClick: () => navigate('/system/settings'),
                },
            ],
        },
    ];

    // 获取当前选中的菜单项
    const getSelectedKeys = () => {
        const pathname = location.pathname;
        if (pathname.startsWith('/system/')) {
            return [pathname];
        }
        return [pathname];
    };

    // 获取展开的菜单项
    const getOpenKeys = () => {
        const pathname = location.pathname;
        if (pathname.startsWith('/system/')) {
            return ['system'];
        }
        return [];
    };

    return (
        <Sider
            width={240}
            className="side-navigation"
            theme="light"
        >
            <Menu
                mode="inline"
                selectedKeys={getSelectedKeys()}
                defaultOpenKeys={getOpenKeys()}
                items={menuItems}
                className="navigation-menu"
            />
        </Sider>
    );
};

export default SideNavigation;