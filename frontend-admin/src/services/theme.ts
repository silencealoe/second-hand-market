/**
 * 主题服务
 */

import { ThemeConfig, ThemeService, ThemeVariables } from '@/types/theme';
import {
    DEFAULT_LIGHT_THEME,
    DEFAULT_DARK_THEME,
    THEME_VARIABLES_MAP,
    THEME_STORAGE_KEY
} from '@/constants/theme';

class ThemeServiceImpl implements ThemeService {
    private currentTheme: ThemeConfig = DEFAULT_LIGHT_THEME;
    private listeners: Array<(theme: ThemeConfig) => void> = [];

    constructor() {
        this.loadUserPreference();
        this.initializeSystemTheme();
    }

    /**
     * 获取当前主题配置
     */
    getCurrentTheme(): ThemeConfig {
        return { ...this.currentTheme };
    }

    /**
     * 设置主题配置
     */
    setTheme(theme: Partial<ThemeConfig>): void {
        this.currentTheme = {
            ...this.currentTheme,
            ...theme,
        };

        this.applyTheme();
        this.saveUserPreference();
        this.notifyListeners();
    }

    /**
     * 切换深色/浅色模式
     */
    toggleMode(): void {
        const newMode = this.currentTheme.mode === 'light' ? 'dark' : 'light';
        const baseTheme = newMode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;

        this.setTheme({
            ...baseTheme,
            mode: newMode,
        });
    }

    /**
     * 重置为默认主题
     */
    resetToDefault(): void {
        this.currentTheme = { ...DEFAULT_LIGHT_THEME };
        this.applyTheme();
        this.saveUserPreference();
        this.notifyListeners();
    }

    /**
     * 保存用户偏好设置
     */
    saveUserPreference(): void {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.currentTheme));
        } catch (error) {
            console.error('保存主题配置失败:', error);
        }
    }

    /**
     * 加载用户偏好设置
     */
    private loadUserPreference(): void {
        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved) {
                const savedTheme = JSON.parse(saved);
                this.currentTheme = {
                    ...DEFAULT_LIGHT_THEME,
                    ...savedTheme,
                };
            }
        } catch (error) {
            console.error('加载主题配置失败:', error);
            this.currentTheme = DEFAULT_LIGHT_THEME;
        }
    }

    /**
     * 初始化系统主题
     */
    private initializeSystemTheme(): void {
        // 如果设置为自动模式，检测系统主题偏好
        if (this.currentTheme.mode === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
            this.currentTheme = {
                ...this.currentTheme,
                ...systemTheme,
                mode: 'auto', // 保持auto模式
            };

            // 监听系统主题变化
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.currentTheme.mode === 'auto') {
                    const newSystemTheme = e.matches ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
                    this.currentTheme = {
                        ...this.currentTheme,
                        ...newSystemTheme,
                        mode: 'auto',
                    };
                    this.applyTheme();
                    this.notifyListeners();
                }
            });
        }

        this.applyTheme();
    }

    /**
     * 应用主题到DOM
     */
    private applyTheme(): void {
        const root = document.documentElement;
        const themeMode = this.currentTheme.mode === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : this.currentTheme.mode;

        // 应用CSS变量
        const variables = THEME_VARIABLES_MAP[themeMode];
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // 设置主题类名
        root.setAttribute('data-theme', themeMode);

        // 为了兼容一些第三方组件，也设置body的类名
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeMode}`);
    }

    /**
     * 添加主题变化监听器
     */
    addListener(listener: (theme: ThemeConfig) => void): () => void {
        this.listeners.push(listener);

        // 返回取消监听的函数
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * 通知所有监听器
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.currentTheme);
            } catch (error) {
                console.error('主题监听器执行失败:', error);
            }
        });
    }

    /**
     * 获取当前主题的Ant Design配置
     */
    getAntdThemeConfig() {
        const isDark = this.currentTheme.mode === 'dark' ||
            (this.currentTheme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        return {
            algorithm: isDark ? 'darkAlgorithm' : 'defaultAlgorithm',
            token: {
                colorPrimary: this.currentTheme.primaryColor,
                borderRadius: this.currentTheme.borderRadius,
                colorSuccess: this.currentTheme.colorScheme.success,
                colorWarning: this.currentTheme.colorScheme.warning,
                colorError: this.currentTheme.colorScheme.error,
                colorInfo: this.currentTheme.colorScheme.info,
            },
            components: {
                Layout: {
                    headerHeight: this.currentTheme.layout.headerHeight,
                    siderBg: isDark ? '#1f1f1f' : '#001529',
                    headerBg: isDark ? '#1f1f1f' : '#001529',
                },
            },
        };
    }
}

// 创建单例实例
export const themeService = new ThemeServiceImpl();

export default themeService;