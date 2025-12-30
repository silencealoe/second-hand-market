/**
 * 主题系统类型定义
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ColorScheme {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

export interface LayoutConfig {
    headerHeight: number;
    siderWidth: number;
    contentPadding: number;
}

export interface ThemeConfig {
    mode: ThemeMode;
    primaryColor: string;
    borderRadius: number;
    colorScheme: ColorScheme;
    layout: LayoutConfig;
}

export interface ThemeVariables {
    '--primary-color': string;
    '--success-color': string;
    '--warning-color': string;
    '--error-color': string;
    '--text-color': string;
    '--bg-color': string;
    '--border-color': string;
    '--shadow-color': string;
    '--header-bg': string;
    '--sider-bg': string;
    '--content-bg': string;
}

export interface ThemeState {
    current: ThemeConfig;
    available: ThemeConfig[];
    loading: boolean;
    error?: string;
}

export interface ThemeService {
    getCurrentTheme(): ThemeConfig;
    setTheme(theme: Partial<ThemeConfig>): void;
    toggleMode(): void;
    resetToDefault(): void;
    saveUserPreference(): void;
}