/**
 * 主题系统常量配置
 */

import { ThemeConfig } from '@/types/theme';

// 默认浅色主题配置
export const DEFAULT_LIGHT_THEME: ThemeConfig = {
    mode: 'light',
    primaryColor: '#1890ff',
    borderRadius: 6,
    colorScheme: {
        primary: '#1890ff',
        secondary: '#722ed1',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
        info: '#13c2c2',
    },
    layout: {
        headerHeight: 64,
        siderWidth: 256,
        contentPadding: 24,
    },
};

// 默认深色主题配置
export const DEFAULT_DARK_THEME: ThemeConfig = {
    mode: 'dark',
    primaryColor: '#177ddc',
    borderRadius: 6,
    colorScheme: {
        primary: '#177ddc',
        secondary: '#642ab5',
        success: '#49aa19',
        warning: '#d89614',
        error: '#dc4446',
        info: '#13a8a8',
    },
    layout: {
        headerHeight: 64,
        siderWidth: 256,
        contentPadding: 24,
    },
};

// 主题变量映射
export const THEME_VARIABLES_MAP = {
    light: {
        '--primary-color': '#1890ff',
        '--success-color': '#52c41a',
        '--warning-color': '#faad14',
        '--error-color': '#f5222d',
        '--text-color': '#000000d9',
        '--bg-color': '#ffffff',
        '--border-color': '#d9d9d9',
        '--shadow-color': 'rgba(0, 0, 0, 0.15)',
        '--header-bg': '#001529',
        '--sider-bg': '#001529',
        '--content-bg': '#f0f2f5',
    },
    dark: {
        '--primary-color': '#177ddc',
        '--success-color': '#49aa19',
        '--warning-color': '#d89614',
        '--error-color': '#dc4446',
        '--text-color': '#ffffffd9',
        '--bg-color': '#141414',
        '--border-color': '#434343',
        '--shadow-color': 'rgba(0, 0, 0, 0.45)',
        '--header-bg': '#1f1f1f',
        '--sider-bg': '#1f1f1f',
        '--content-bg': '#000000',
    },
};

// 本地存储键名
export const THEME_STORAGE_KEY = 'admin-theme-config';

// 可用主题列表
export const AVAILABLE_THEMES: ThemeConfig[] = [
    DEFAULT_LIGHT_THEME,
    DEFAULT_DARK_THEME,
];