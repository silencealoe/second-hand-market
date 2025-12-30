/**
 * 主题状态管理模型
 */

import { useState, useCallback } from 'react';
import { ThemeConfig, ThemeState } from '@/types/theme';
import themeService from '@/services/theme';
import { DEFAULT_LIGHT_THEME, AVAILABLE_THEMES } from '@/constants/theme';

export default function useThemeModel() {
    const [themeState, setThemeState] = useState<ThemeState>({
        current: themeService.getCurrentTheme(),
        available: AVAILABLE_THEMES,
        loading: false,
        error: undefined,
    });

    // 设置主题
    const setTheme = useCallback(async (theme: Partial<ThemeConfig>) => {
        setThemeState(prev => ({ ...prev, loading: true, error: undefined }));

        try {
            themeService.setTheme(theme);
            setThemeState(prev => ({
                ...prev,
                current: themeService.getCurrentTheme(),
                loading: false,
            }));
        } catch (error) {
            setThemeState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '主题设置失败',
            }));
        }
    }, []);

    // 切换深色/浅色模式
    const toggleMode = useCallback(async () => {
        setThemeState(prev => ({ ...prev, loading: true }));

        try {
            themeService.toggleMode();
            setThemeState(prev => ({
                ...prev,
                current: themeService.getCurrentTheme(),
                loading: false,
            }));
        } catch (error) {
            setThemeState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '主题切换失败',
            }));
        }
    }, []);

    // 重置为默认主题
    const resetToDefault = useCallback(async () => {
        setThemeState(prev => ({ ...prev, loading: true }));

        try {
            themeService.resetToDefault();
            setThemeState(prev => ({
                ...prev,
                current: themeService.getCurrentTheme(),
                loading: false,
            }));
        } catch (error) {
            setThemeState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '主题重置失败',
            }));
        }
    }, []);

    // 清除错误
    const clearError = useCallback(() => {
        setThemeState(prev => ({ ...prev, error: undefined }));
    }, []);

    // 监听主题变化
    const subscribeToThemeChanges = useCallback(() => {
        const unsubscribe = themeService.addListener((newTheme) => {
            setThemeState(prev => ({
                ...prev,
                current: newTheme,
            }));
        });

        return unsubscribe;
    }, []);

    return {
        themeState,
        setTheme,
        toggleMode,
        resetToDefault,
        clearError,
        subscribeToThemeChanges,
    };
}