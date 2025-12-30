/**
 * 布局系统常量配置
 */

import { LayoutConfig, BreakpointConfig } from '@/types/layout';

// 默认布局配置
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    layout: 'side',
    fixedHeader: true,
    fixedSider: true,
    splitMenus: false,
    contentWidth: 'Fluid',
    colorWeak: false,
    siderWidth: 256,
    headerHeight: 64,
    collapsed: false,
};

// 响应式断点配置
export const BREAKPOINTS: BreakpointConfig = {
    xs: 576,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
};

// 移动端布局配置
export const MOBILE_LAYOUT_CONFIG: Partial<LayoutConfig> = {
    siderWidth: 200,
    headerHeight: 56,
    collapsed: true,
};

// 平板端布局配置
export const TABLET_LAYOUT_CONFIG: Partial<LayoutConfig> = {
    siderWidth: 220,
    headerHeight: 60,
};

// 布局存储键名
export const LAYOUT_STORAGE_KEY = 'admin-layout-config';