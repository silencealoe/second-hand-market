/**
 * 主题系统 React Hook
 */

import { useState, useEffect } from 'react';
import { ThemeConfig } from '@/types/theme';
import themeService from '@/services/theme';

export interface UseThemeReturn {
    theme: ThemeConfig;
    setTheme: (theme: Partial<ThemeConfig>) => void;
    toggleMode: () => void;
    resetToDefault: () => void;
    loading: boolean;
    isDark: boolean;
}

/**
 * 使用主题系统的Hook
 */
export function useTheme(): UseThemeReturn {
    const [theme, setThemeState] = useState<ThemeConfig>(themeService.getCurrentTheme());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 监听主题变化
        const unsubscribe = themeService.addListener((newTheme) => {
            setThemeState(newTheme);
        });

        return unsubscribe;
    }, []);

    const setTheme = (newTheme: Partial<ThemeConfig>) => {
        setLoading(true);
        try {
            themeService.setTheme(newTheme);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setLoading(true);
        try {
            themeService.toggleMode();
        } finally {
            setLoading(false);
        }
    };

    const resetToDefault = () => {
        setLoading(true);
        try {
            themeService.resetToDefault();
        } finally {
            setLoading(false);
        }
    };

    // 计算是否为深色模式
    const isDark = theme.mode === 'dark' ||
        (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return {
        theme,
        setTheme,
        toggleMode,
        resetToDefault,
        loading,
        isDark,
    };
}