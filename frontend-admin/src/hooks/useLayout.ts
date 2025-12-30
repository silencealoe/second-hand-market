/**
 * 布局系统 React Hook
 */

import { useState, useEffect } from 'react';
import { LayoutState, ResponsiveState, LayoutConfig, BreadcrumbItem } from '@/types/layout';
import layoutService from '@/services/layout';

export interface UseLayoutReturn {
    layoutState: LayoutState;
    responsiveState: ResponsiveState;
    updateLayoutConfig: (config: Partial<LayoutConfig>) => void;
    toggleCollapsed: () => void;
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
    setActiveMenuKeys: (keys: string[]) => void;
    resetToDefault: () => void;
}

/**
 * 使用布局系统的Hook
 */
export function useLayout(): UseLayoutReturn {
    const [layoutState, setLayoutState] = useState<LayoutState>(layoutService.getLayoutState());
    const [responsiveState, setResponsiveState] = useState<ResponsiveState>(layoutService.getResponsiveState());

    useEffect(() => {
        // 监听布局状态变化
        const unsubscribeLayout = layoutService.addListener((newState) => {
            setLayoutState(newState);
        });

        // 监听响应式状态变化
        const unsubscribeResponsive = layoutService.addResponsiveListener((newState) => {
            setResponsiveState(newState);
        });

        return () => {
            unsubscribeLayout();
            unsubscribeResponsive();
        };
    }, []);

    const updateLayoutConfig = (config: Partial<LayoutConfig>) => {
        layoutService.updateLayoutConfig(config);
    };

    const toggleCollapsed = () => {
        layoutService.toggleCollapsed();
    };

    const setBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
        layoutService.setBreadcrumbs(breadcrumbs);
    };

    const setActiveMenuKeys = (keys: string[]) => {
        layoutService.setActiveMenuKeys(keys);
    };

    const resetToDefault = () => {
        layoutService.resetToDefault();
    };

    return {
        layoutState,
        responsiveState,
        updateLayoutConfig,
        toggleCollapsed,
        setBreadcrumbs,
        setActiveMenuKeys,
        resetToDefault,
    };
}