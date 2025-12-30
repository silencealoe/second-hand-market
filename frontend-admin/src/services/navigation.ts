/**
 * 导航状态管理服务
 */

import { MenuItem } from '@/types/layout';

interface NavigationState {
    activeKeys: string[];
    openKeys: string[];
    selectedKeys: string[];
    menuItems: MenuItem[];
}

class NavigationService {
    private state: NavigationState;
    private listeners: Array<(state: NavigationState) => void> = [];

    constructor() {
        this.state = {
            activeKeys: [],
            openKeys: [],
            selectedKeys: [],
            menuItems: this.getDefaultMenuItems(),
        };
    }

    /**
     * 获取默认菜单项
     */
    private getDefaultMenuItems(): MenuItem[] {
        return [
            {
                key: '/home',
                label: '数据仪表板',
                path: '/home',
            },
            {
                key: '/users',
                label: '用户管理',
                path: '/users',
                children: [
                    {
                        key: '/users/list',
                        label: '用户列表',
                        path: '/users/list',
                    },
                    {
                        key: '/users/create',
                        label: '新增用户',
                        path: '/users/create',
                    },
                ],
            },
            {
                key: '/products',
                label: '商品管理',
                path: '/products',
                children: [
                    {
                        key: '/products/list',
                        label: '商品列表',
                        path: '/products/list',
                    },
                    {
                        key: '/products/create',
                        label: '新增商品',
                        path: '/products/create',
                    },
                    {
                        key: '/products/categories',
                        label: '商品分类',
                        path: '/products/categories',
                    },
                ],
            },
            {
                key: '/analytics',
                label: '数据分析',
                path: '/analytics',
                children: [
                    {
                        key: '/analytics/sales',
                        label: '销售分析',
                        path: '/analytics/sales',
                    },
                    {
                        key: '/analytics/users',
                        label: '用户分析',
                        path: '/analytics/users',
                    },
                ],
            },
            {
                key: '/settings',
                label: '系统设置',
                path: '/settings',
                children: [
                    {
                        key: '/settings/profile',
                        label: '个人资料',
                        path: '/settings/profile',
                    },
                    {
                        key: '/settings/system',
                        label: '系统配置',
                        path: '/settings/system',
                    },
                ],
            },
        ];
    }

    /**
     * 获取当前导航状态
     */
    getState(): NavigationState {
        return { ...this.state };
    }

    /**
     * 根据路径设置活动菜单
     */
    setActiveByPath(pathname: string): void {
        const { selectedKeys, openKeys } = this.calculateKeysFromPath(pathname);

        this.state = {
            ...this.state,
            activeKeys: selectedKeys,
            selectedKeys,
            openKeys: [...new Set([...this.state.openKeys, ...openKeys])], // 合并并去重
        };

        this.notifyListeners();
    }

    /**
     * 设置选中的菜单项
     */
    setSelectedKeys(keys: string[]): void {
        this.state = {
            ...this.state,
            selectedKeys: keys,
            activeKeys: keys,
        };

        this.notifyListeners();
    }

    /**
     * 设置展开的菜单项
     */
    setOpenKeys(keys: string[]): void {
        this.state = {
            ...this.state,
            openKeys: keys,
        };

        this.notifyListeners();
    }

    /**
     * 切换菜单项展开状态
     */
    toggleOpenKey(key: string): void {
        const openKeys = [...this.state.openKeys];
        const index = openKeys.indexOf(key);

        if (index > -1) {
            openKeys.splice(index, 1);
        } else {
            openKeys.push(key);
        }

        this.setOpenKeys(openKeys);
    }

    /**
     * 根据路径计算菜单键值
     */
    private calculateKeysFromPath(pathname: string): { selectedKeys: string[]; openKeys: string[] } {
        const selectedKeys: string[] = [];
        const openKeys: string[] = [];

        // 查找匹配的菜单项
        const findMatchingItems = (items: MenuItem[], parentKey?: string): void => {
            items.forEach(item => {
                if (item.path && pathname.startsWith(item.path)) {
                    selectedKeys.push(item.key);

                    if (parentKey) {
                        openKeys.push(parentKey);
                    }
                }

                if (item.children) {
                    findMatchingItems(item.children, item.key);
                }
            });
        };

        findMatchingItems(this.state.menuItems);

        // 如果没有精确匹配，尝试模糊匹配
        if (selectedKeys.length === 0) {
            const segments = pathname.split('/').filter(Boolean);

            for (let i = segments.length; i > 0; i--) {
                const testPath = '/' + segments.slice(0, i).join('/');
                findMatchingItems(this.state.menuItems);

                if (selectedKeys.length > 0) {
                    break;
                }
            }
        }

        return { selectedKeys, openKeys };
    }

    /**
     * 获取菜单项通过键值
     */
    getMenuItemByKey(key: string): MenuItem | null {
        const findItem = (items: MenuItem[]): MenuItem | null => {
            for (const item of items) {
                if (item.key === key) {
                    return item;
                }
                if (item.children) {
                    const found = findItem(item.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return findItem(this.state.menuItems);
    }

    /**
     * 获取所有可访问的路径
     */
    getAllPaths(): string[] {
        const paths: string[] = [];

        const collectPaths = (items: MenuItem[]): void => {
            items.forEach(item => {
                if (item.path) {
                    paths.push(item.path);
                }
                if (item.children) {
                    collectPaths(item.children);
                }
            });
        };

        collectPaths(this.state.menuItems);
        return paths;
    }

    /**
     * 添加菜单项
     */
    addMenuItem(item: MenuItem, parentKey?: string): void {
        if (parentKey) {
            const parent = this.getMenuItemByKey(parentKey);
            if (parent) {
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(item);
            }
        } else {
            this.state.menuItems.push(item);
        }

        this.notifyListeners();
    }

    /**
     * 移除菜单项
     */
    removeMenuItem(key: string): void {
        const removeFromItems = (items: MenuItem[]): MenuItem[] => {
            return items.filter(item => {
                if (item.key === key) {
                    return false;
                }
                if (item.children) {
                    item.children = removeFromItems(item.children);
                }
                return true;
            });
        };

        this.state.menuItems = removeFromItems(this.state.menuItems);
        this.notifyListeners();
    }

    /**
     * 添加状态监听器
     */
    addListener(listener: (state: NavigationState) => void): () => void {
        this.listeners.push(listener);

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
                listener(this.state);
            } catch (error) {
                console.error('导航监听器执行失败:', error);
            }
        });
    }

    /**
     * 重置导航状态
     */
    reset(): void {
        this.state = {
            activeKeys: [],
            openKeys: [],
            selectedKeys: [],
            menuItems: this.getDefaultMenuItems(),
        };

        this.notifyListeners();
    }
}

// 创建单例实例
export const navigationService = new NavigationService();

export default navigationService;