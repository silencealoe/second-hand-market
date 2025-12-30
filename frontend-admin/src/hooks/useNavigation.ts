/**
 * 导航状态管理 Hook
 */

import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/layout';
import navigationService from '@/services/navigation';

interface NavigationState {
    activeKeys: string[];
    openKeys: string[];
    selectedKeys: string[];
    menuItems: MenuItem[];
}

export interface UseNavigationReturn {
    navigationState: NavigationState;
    setActiveByPath: (pathname: string) => void;
    setSelectedKeys: (keys: string[]) => void;
    setOpenKeys: (keys: string[]) => void;
    toggleOpenKey: (key: string) => void;
    getMenuItemByKey: (key: string) => MenuItem | null;
    getAllPaths: () => string[];
    addMenuItem: (item: MenuItem, parentKey?: string) => void;
    removeMenuItem: (key: string) => void;
    reset: () => void;
}

/**
 * 使用导航状态管理的Hook
 */
export function useNavigation(): UseNavigationReturn {
    const [navigationState, setNavigationState] = useState<NavigationState>(
        navigationService.getState()
    );

    useEffect(() => {
        // 监听导航状态变化
        const unsubscribe = navigationService.addListener((newState) => {
            setNavigationState(newState);
        });

        return unsubscribe;
    }, []);

    const setActiveByPath = (pathname: string) => {
        navigationService.setActiveByPath(pathname);
    };

    const setSelectedKeys = (keys: string[]) => {
        navigationService.setSelectedKeys(keys);
    };

    const setOpenKeys = (keys: string[]) => {
        navigationService.setOpenKeys(keys);
    };

    const toggleOpenKey = (key: string) => {
        navigationService.toggleOpenKey(key);
    };

    const getMenuItemByKey = (key: string) => {
        return navigationService.getMenuItemByKey(key);
    };

    const getAllPaths = () => {
        return navigationService.getAllPaths();
    };

    const addMenuItem = (item: MenuItem, parentKey?: string) => {
        navigationService.addMenuItem(item, parentKey);
    };

    const removeMenuItem = (key: string) => {
        navigationService.removeMenuItem(key);
    };

    const reset = () => {
        navigationService.reset();
    };

    return {
        navigationState,
        setActiveByPath,
        setSelectedKeys,
        setOpenKeys,
        toggleOpenKey,
        getMenuItemByKey,
        getAllPaths,
        addMenuItem,
        removeMenuItem,
        reset,
    };
}