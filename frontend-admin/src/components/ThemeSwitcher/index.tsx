/**
 * 主题切换器组件
 */

import React from 'react';
import { Button, Dropdown, Space, Tooltip } from 'antd';
import {
    BulbOutlined,
    BulbFilled,
    SettingOutlined,
    SunOutlined,
    MoonOutlined,
    DesktopOutlined
} from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';
import type { MenuProps } from 'antd';

interface ThemeSwitcherProps {
    size?: 'small' | 'middle' | 'large';
    type?: 'button' | 'icon';
    placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
    size = 'middle',
    type = 'icon',
    placement = 'bottomRight'
}) => {
    const { theme, toggleMode, setTheme, isDark, loading } = useTheme();

    // 主题模式菜单项
    const modeMenuItems: MenuProps['items'] = [
        {
            key: 'light',
            label: (
                <Space>
                    <SunOutlined />
                    浅色模式
                </Space>
            ),
            onClick: () => setTheme({ mode: 'light' }),
        },
        {
            key: 'dark',
            label: (
                <Space>
                    <MoonOutlined />
                    深色模式
                </Space>
            ),
            onClick: () => setTheme({ mode: 'dark' }),
        },
        {
            key: 'auto',
            label: (
                <Space>
                    <DesktopOutlined />
                    跟随系统
                </Space>
            ),
            onClick: () => setTheme({ mode: 'auto' }),
        },
    ];

    // 获取当前模式图标
    const getCurrentModeIcon = () => {
        switch (theme.mode) {
            case 'light':
                return <SunOutlined />;
            case 'dark':
                return <MoonOutlined />;
            case 'auto':
                return <DesktopOutlined />;
            default:
                return <SunOutlined />;
        }
    };

    // 按钮类型渲染
    if (type === 'button') {
        return (
            <Dropdown
                menu={{ items: modeMenuItems }}
                placement={placement}
                trigger={['click']}
            >
                <Button
                    size={size}
                    loading={loading}
                    icon={getCurrentModeIcon()}
                >
                    主题切换
                </Button>
            </Dropdown>
        );
    }

    // 图标类型渲染
    return (
        <Dropdown
            menu={{ items: modeMenuItems }}
            placement={placement}
            trigger={['click']}
        >
            <Tooltip title={`当前: ${theme.mode === 'light' ? '浅色' : theme.mode === 'dark' ? '深色' : '跟随系统'}模式`}>
                <Button
                    type="text"
                    size={size}
                    loading={loading}
                    icon={isDark ? <BulbFilled /> : <BulbOutlined />}
                    style={{
                        color: isDark ? '#ffd700' : '#1890ff',
                        border: 'none',
                        boxShadow: 'none'
                    }}
                />
            </Tooltip>
        </Dropdown>
    );
};

export default ThemeSwitcher;