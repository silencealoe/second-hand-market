/**
 * 布局服务
 */

import { LayoutConfig, LayoutState, ResponsiveState, BreadcrumbItem } from '@/types/layout';
import {
    DEFAULT_LAYOUT_CONFIG,
    BREAKPOINTS,
    MOBILE_LAYOUT_CONFIG,
    TABLET_LAYOUT_CONFIG,
    LAYOUT_STORAGE_KEY
} from '@/constants/layout';

class LayoutService {
    private layoutState: LayoutState;
    private responsiveState: ResponsiveState;
    private listeners: Array<(state: LayoutState) => void> = [];
    private responsiveListeners: Array<(state: ResponsiveState) => void> = [];

    constructor() {
        this.layoutState = {
            config: { ...DEFAULT_LAYOUT_CONFIG },
            collapsed: false,
            mobile: false,
            breadcrumbs: [],
            activeMenuKeys: [],
        };

        this.responsiveState = {
            breakpoint: 'lg',
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            isMobile: false,
            isTablet: false,
        };

        this.loadUserPreference();
        this.initializeResponsive();
    }

    /**
     * 获取当前布局状态
     */
    getLayoutState(): LayoutState {
        return { ...this.layoutState };
    }

    /**
     * 获取响应式状态
     */
    getResponsiveState(): ResponsiveState {
        return { ...this.responsiveState };
    }

    /**
     * 更新布局配置
     */
    updateLayoutConfig(config: Partial<LayoutConfig>): void {
        this.layoutState.config = {
            ...this.layoutState.config,
            ...config,
        };

        this.saveUserPreference();
        this.notifyListeners();
    }

    /**
     * 切换侧边栏折叠状态
     */
    toggleCollapsed(): void {
        this.layoutState.collapsed = !this.layoutState.collapsed;
        this.layoutState.config.collapsed = this.layoutState.collapsed;
        this.saveUserPreference();
        this.notifyListeners();
    }

    /**
     * 设置面包屑导航
     */
    setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
        this.layoutState.breadcrumbs = breadcrumbs;
        this.notifyListeners();
    }

    /**
     * 设置活动菜单项
     */
    setActiveMenuKeys(keys: string[]): void {
        this.layoutState.activeMenuKeys = keys;
        this.notifyListeners();
    }

    /**
     * 添加布局状态监听器
     */
    addListener(listener: (state: LayoutState) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * 添加响应式状态监听器
     */
    addResponsiveListener(listener: (state: ResponsiveState) => void): () => void {
        this.responsiveListeners.push(listener);
        return () => {
            const index = this.responsiveListeners.indexOf(listener);
            if (index > -1) {
                this.responsiveListeners.splice(index, 1);
            }
        };
    }

    /**
     * 初始化响应式监听
     */
    private initializeResponsive(): void {
        this.updateResponsiveState();

        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));

        // 初始化时根据屏幕尺寸调整布局
        this.adaptLayoutToScreen();
    }

    /**
     * 处理窗口大小变化
     */
    private handleResize(): void {
        this.updateResponsiveState();
        this.adaptLayoutToScreen();
    }

    /**
     * 更新响应式状态
     */
    private updateResponsiveState(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        let breakpoint: keyof typeof BREAKPOINTS = 'lg';
        let isMobile = false;
        let isTablet = false;

        if (width < BREAKPOINTS.sm) {
            breakpoint = 'xs';
            isMobile = true;
        } else if (width < BREAKPOINTS.md) {
            breakpoint = 'sm';
            isMobile = true;
        } else if (width < BREAKPOINTS.lg) {
            breakpoint = 'md';
            isTablet = true;
        } else if (width < BREAKPOINTS.xl) {
            breakpoint = 'lg';
        } else if (width < BREAKPOINTS.xxl) {
            breakpoint = 'xl';
        } else {
            breakpoint = 'xxl';
        }

        this.responsiveState = {
            breakpoint,
            screenWidth: width,
            screenHeight: height,
            isMobile,
            isTablet,
        };

        this.layoutState.mobile = isMobile;
        this.notifyResponsiveListeners();
    }

    /**
     * 根据屏幕尺寸调整布局
     */
    private adaptLayoutToScreen(): void {
        const { isMobile, isTablet } = this.responsiveState;
        let adaptiveConfig: Partial<LayoutConfig> = {};

        if (isMobile) {
            adaptiveConfig = {
                ...MOBILE_LAYOUT_CONFIG,
                collapsed: true,
            };
        } else if (isTablet) {
            adaptiveConfig = {
                ...TABLET_LAYOUT_CONFIG,
                collapsed: false,
            };
        } else {
            // 桌面端恢复用户设置
            const savedConfig = this.loadUserPreference();
            if (savedConfig) {
                adaptiveConfig = savedConfig;
            }
        }

        if (Object.keys(adaptiveConfig).length > 0) {
            this.layoutState.config = {
                ...this.layoutState.config,
                ...adaptiveConfig,
            };
            this.layoutState.collapsed = adaptiveConfig.collapsed ?? this.layoutState.collapsed;
            this.notifyListeners();
        }
    }

    /**
     * 保存用户偏好设置
     */
    private saveUserPreference(): void {
        try {
            // 只在非移动端保存用户设置
            if (!this.responsiveState.isMobile) {
                localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(this.layoutState.config));
            }
        } catch (error) {
            console.error('保存布局配置失败:', error);
        }
    }

    /**
     * 加载用户偏好设置
     */
    private loadUserPreference(): LayoutConfig | null {
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (saved) {
                const savedConfig = JSON.parse(saved);
                this.layoutState.config = {
                    ...DEFAULT_LAYOUT_CONFIG,
                    ...savedConfig,
                };
                return this.layoutState.config;
            }
        } catch (error) {
            console.error('加载布局配置失败:', error);
        }
        return null;
    }

    /**
     * 通知布局状态监听器
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.layoutState);
            } catch (error) {
                console.error('布局监听器执行失败:', error);
            }
        });
    }

    /**
     * 通知响应式状态监听器
     */
    private notifyResponsiveListeners(): void {
        this.responsiveListeners.forEach(listener => {
            try {
                listener(this.responsiveState);
            } catch (error) {
                console.error('响应式监听器执行失败:', error);
            }
        });
    }

    /**
     * 重置为默认配置
     */
    resetToDefault(): void {
        this.layoutState.config = { ...DEFAULT_LAYOUT_CONFIG };
        this.layoutState.collapsed = false;
        this.saveUserPreference();
        this.notifyListeners();
    }
}

// 创建单例实例
export const layoutService = new LayoutService();

export default layoutService;