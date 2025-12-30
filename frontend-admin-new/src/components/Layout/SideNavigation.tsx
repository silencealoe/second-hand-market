import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined
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
            key: '/users',
            icon: <UserOutlined />,
            label: '用户管理',
            onClick: () => navigate('/users'),
        },
        {
            key: '/system',
            icon: <SettingOutlined />,
            label: '系统管理',
            onClick: () => navigate('/system'),
        },
    ];

    return (
        <Sider
            width={240}
            className="side-navigation"
            theme="light"
        >
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                className="navigation-menu"
            />
        </Sider>
    );
};

export default SideNavigation;