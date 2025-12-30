/**
 * 图标映射工具
 */

import React from 'react';
import {
    DashboardOutlined,
    UserOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    SettingOutlined,
    HomeOutlined,
} from '@ant-design/icons';

// 图标映射表
const ICON_MAP: Record<string, React.ReactNode> = {
    HomeOutlined: <HomeOutlined />,
    DashboardOutlined: <DashboardOutlined />,
    UserOutlined: <UserOutlined />,
    ShoppingOutlined: <ShoppingOutlined />,
    BarChartOutlined: <BarChartOutlined />,
    SettingOutlined: <SettingOutlined />,
};

/**
 * 根据图标类型获取图标组件
 */
export const getIcon = (iconType?: string): React.ReactNode => {
    if (!iconType) return null;
    return ICON_MAP[iconType] || null;
};

export default getIcon;