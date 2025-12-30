/**
 * 增强的导航菜单组件
 */

import React, { useEffect } from 'react';
import { Menu, Badge, Tooltip } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useLayout } from '@/hooks/useLayout';
import { MenuItem } from '@/types/layout';
import type { MenuProps } from 'antd';
import './EnhancedMenu.less';

interface EnhancedMenuProps {
    mode?: 'vertical' | 'horizontal' | 'inline';
    theme?: 'light' | 'dark';
    className?: string;
    style?: React.CSSProperties;
    inlineCollapsed?: boolean;
}

const EnhancedMenu: React.FC<EnhancedMenuProps> = ({
    mode = 'inline',
    theme = 'dark',
    className = '',
    style = {},
    inlineCollapsed = false,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { navigationState, setActiveByPath, setOpenKeys } = useNavigation();

    // 图标映射
    const getIcon = (key: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            '/home': <DashboardOutlined />,
            '/users': <UserOutlined />,
            '/products': <ShoppingOutlined />,
            '/analytics': <BarChartOutlined />,
            '/settings': <SettingOutlined />,
        };
        return iconMap[key];
    };

    // 监听路由变化，更新菜单状态
    useEffect(() => {
        setActiveByPath(location.pathname);
    }, [location.pathname, setActiveByPath]);

    // 处理菜单点击
    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        const menuItem = navigationState.menuItems.find(item =>
            findMenuItemByKey(item, key)
        );

        if (menuItem) {
            const targetItem = findMenuItemByKey(menuItem, key);
            if (targetItem?.path) {
                navigate(targetItem.path);
            }
        }
    };

    // 处理子菜单展开/收起
    const handleOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
        setOpenKeys(openKeys as string[]);
    };

    // 递归查找菜单项
    const findMenuItemByKey = (item: MenuItem, key: string): MenuItem | null => {
        if (item.key === key) {
            return item;
        }

        if (item.children) {
            for (const child of item.children) {
                const found = findMenuItemByKey(child, key);
                if (found) return found;
            }
        }

        return null;
    };

    // 转换菜单项为Ant Design Menu格式
    const convertToAntdMenuItems = (items: MenuItem[]): MenuProps['items'] => {
        return items.map(item => {
            const menuItem: any = {
                key: item.key,
                icon: getIcon(item.key),
                disabled: item.disabled,
                className: getMenuItemClassName(item),
            };

            // 处理标签内容
            if (item.badge) {
                menuItem.label = (
                    <div className="menu-item-content">
                        <span className="menu-item-text">{item.label}</span>
                        <Badge
                            count={item.badge}
                            size="small"
                            className="menu-item-badge"
                        />
                    </div>
                );
            } else {
                menuItem.label = (
                    <Tooltip
                        title={inlineCollapsed ? item.label : ''}
                        placement="right"
                    >
                        <span className="menu-item-text">{item.label}</span>
                    </Tooltip>
                );
            }

            // 处理子菜单
            if (item.children && item.children.length > 0) {
                menuItem.children = convertToAntdMenuItems(item.children);
                menuItem.type = 'submenu';
            }

            return menuItem;
        });
    };

    // 获取菜单项的CSS类名
    const getMenuItemClassName = (item: MenuItem): string => {
        const classes: string[] = ['enhanced-menu-item'];

        if (item.disabled) {
            classes.push('menu-item-disabled');
        }

        if (item.hidden) {
            classes.push('menu-item-hidden');
        }

        if (navigationState.selectedKeys.includes(item.key)) {
            classes.push('menu-item-active');
        }

        return classes.join(' ');
    };

    return (
        <Menu
            mode={mode}
            theme={theme}
            className={`enhanced-menu ${className}`}
            style={style}
            selectedKeys={navigationState.selectedKeys}
            openKeys={navigationState.openKeys}
            items={convertToAntdMenuItems(navigationState.menuItems)}
            onClick={handleMenuClick}
            onOpenChange={handleOpenChange}
            inlineCollapsed={inlineCollapsed}
        />
    );
};

export default EnhancedMenu;