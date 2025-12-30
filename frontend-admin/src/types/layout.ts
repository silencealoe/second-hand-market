/**
 * 布局系统类型定义
 */

export type LayoutType = 'side' | 'top' | 'mix';
export type ContentWidth = 'Fluid' | 'Fixed';

export interface BreakpointConfig {
    xs: number; // < 576px
    sm: number; // >= 576px
    md: number; // >= 768px
    lg: number; // >= 992px
    xl: number; // >= 1200px
    xxl: number; // >= 1600px
}

export interface LayoutConfig {
    layout: LayoutType;
    fixedHeader: boolean;
    fixedSider: boolean;
    splitMenus: boolean;
    contentWidth: ContentWidth;
    colorWeak: boolean;
    siderWidth: number;
    headerHeight: number;
    collapsed: boolean;
}

export interface MenuItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    children?: MenuItem[];
    badge?: number | string;
    disabled?: boolean;
    hidden?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    path?: string;
    icon?: React.ReactNode;
}

export interface LayoutState {
    config: LayoutConfig;
    collapsed: boolean;
    mobile: boolean;
    breadcrumbs: BreadcrumbItem[];
    activeMenuKeys: string[];
}

export interface ResponsiveState {
    breakpoint: keyof BreakpointConfig;
    screenWidth: number;
    screenHeight: number;
    isMobile: boolean;
    isTablet: boolean;
}