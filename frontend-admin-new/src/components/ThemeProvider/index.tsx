import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { ThemeMode } from '@/types';

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

// 获取Ant Design主题配置
const getAntdTheme = (themeMode: ThemeMode) => {
    const isDark = themeMode === 'dark';

    return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: '#ff6b35',
            borderRadius: 8,
            colorBgContainer: isDark ? '#252837' : '#ffffff',
            colorBgElevated: isDark ? '#2d3142' : '#ffffff',
            colorBgLayout: isDark ? '#1a1d29' : '#f5f5f5',
            colorText: isDark ? '#ffffff' : '#333333',
            colorTextSecondary: isDark ? '#a0a3bd' : '#666666',
            colorBorder: isDark ? '#3a3d4a' : '#e0e0e0',
        },
        components: {
            Layout: {
                headerBg: isDark ? '#1a1d29' : '#ffffff',
                siderBg: isDark ? '#1a1d29' : '#ffffff',
                bodyBg: isDark ? '#1a1d29' : '#f5f5f5',
            },
            Menu: {
                itemBg: 'transparent',
                itemSelectedBg: '#ff6b35',
                itemSelectedColor: '#ffffff',
                itemHoverBg: isDark ? '#2d3142' : '#f0f0f0',
            },
            Card: {
                colorBgContainer: isDark ? '#252837' : '#ffffff',
            },
        },
    };
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');

    // 初始化主题
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeMode;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemTheme;

        setCurrentTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';
        setCurrentTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            <ConfigProvider theme={getAntdTheme(currentTheme)}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};