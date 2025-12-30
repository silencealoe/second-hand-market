import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import {
    BulbOutlined,
    BulbFilled,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import './TopNavigation.less';

const { Header } = Layout;
const { Title } = Typography;

const TopNavigation: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('退出登录失败:', error);
            // 即使退出登录失败，也要跳转到登录页
            navigate('/login');
        }
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            label: '退出登录',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    return (
        <Header className="top-navigation">
            <div className="nav-left">
                <Title level={4} className="system-title">
                    二手商城管理后台
                </Title>
            </div>

            <div className="nav-right">
                <Space size="middle">
                    {/* 主题切换按钮 */}
                    <Button
                        type="text"
                        icon={theme === 'dark' ? <BulbFilled /> : <BulbOutlined />}
                        onClick={toggleTheme}
                        className="theme-toggle"
                        title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
                    />

                    {/* 用户名称 */}
                    <span className="user-name">{user?.realName || user?.username}</span>

                    {/* 用户头像下拉菜单 */}
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Avatar
                            src={user?.avatar}
                            icon={<UserOutlined />}
                            className="user-avatar"
                            style={{ cursor: 'pointer' }}
                        />
                    </Dropdown>
                </Space>
            </div>
        </Header>
    );
};

export default TopNavigation;