/**
 * 主题提供者组件
 */

import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useTheme } from '@/hooks/useTheme';
import themeService from '@/services/theme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { theme: currentTheme, isDark } = useTheme();

    useEffect(() => {
        // 初始化主题
        const initTheme = async () => {
            // 这里可以添加异步主题初始化逻辑
        };

        initTheme();
    }, []);

    // 获取Ant Design主题配置
    const antdConfig = themeService.getAntdThemeConfig();

    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: currentTheme.primaryColor,
                    borderRadius: currentTheme.borderRadius,
                    colorSuccess: currentTheme.colorScheme.success,
                    colorWarning: currentTheme.colorScheme.warning,
                    colorError: currentTheme.colorScheme.error,
                    colorInfo: currentTheme.colorScheme.info,
                },
                components: {
                    Layout: {
                        headerHeight: currentTheme.layout.headerHeight,
                        siderBg: isDark ? '#1f1f1f' : '#001529',
                        headerBg: isDark ? '#1f1f1f' : '#001529',
                    },
                    Menu: {
                        darkItemBg: isDark ? '#1f1f1f' : '#001529',
                        darkSubMenuItemBg: isDark ? '#1f1f1f' : '#001529',
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default ThemeProvider;