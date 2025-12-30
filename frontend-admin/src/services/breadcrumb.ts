/**
 * 面包屑导航服务
 */

import { BreadcrumbItem } from '@/types/layout';

interface RouteConfig {
    path: string;
    title: string;
    iconType?: string;
    parent?: string;
}

// 路由配置映射
const ROUTE_CONFIG: Record<string, RouteConfig> = {
    '/': {
        path: '/',
        title: '首页',
        iconType: 'HomeOutlined',
    },
    '/home': {
        path: '/home',
        title: '数据仪表板',
        iconType: 'DashboardOutlined',
    },
    '/users': {
        path: '/users',
        title: '用户管理',
        iconType: 'UserOutlined',
    },
    '/users/list': {
        path: '/users/list',
        title: '用户列表',
        parent: '/users',
    },
    '/users/create': {
        path: '/users/create',
        title: '新增用户',
        parent: '/users',
    },
    '/users/edit': {
        path: '/users/edit',
        title: '编辑用户',
        parent: '/users',
    },
    '/products': {
        path: '/products',
        title: '商品管理',
        iconType: 'ShoppingOutlined',
    },
    '/products/list': {
        path: '/products/list',
        title: '商品列表',
        parent: '/products',
    },
    '/products/create': {
        path: '/products/create',
        title: '新增商品',
        parent: '/products',
    },
    '/products/edit': {
        path: '/products/edit',
        title: '编辑商品',
        parent: '/products',
    },
    '/products/categories': {
        path: '/products/categories',
        title: '商品分类',
        parent: '/products',
    },
    '/analytics': {
        path: '/analytics',
        title: '数据分析',
        iconType: 'BarChartOutlined',
    },
    '/analytics/sales': {
        path: '/analytics/sales',
        title: '销售分析',
        parent: '/analytics',
    },
    '/analytics/users': {
        path: '/analytics/users',
        title: '用户分析',
        parent: '/analytics',
    },
    '/settings': {
        path: '/settings',
        title: '系统设置',
        iconType: 'SettingOutlined',
    },
    '/settings/profile': {
        path: '/settings/profile',
        title: '个人资料',
        parent: '/settings',
    },
    '/settings/system': {
        path: '/settings/system',
        title: '系统配置',
        parent: '/settings',
    },
};

class BreadcrumbService {
    /**
     * 根据路径生成面包屑导航
     */
    generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
        const breadcrumbs: BreadcrumbItem[] = [];

        // 总是添加首页作为第一个面包屑
        if (pathname !== '/home') {
            breadcrumbs.push({
                title: '首页',
                path: '/home',
                // icon 将在组件中根据 iconType 生成
            });
        }

        // 查找当前路径的配置
        const currentRoute = this.findRouteConfig(pathname);
        if (!currentRoute) {
            return breadcrumbs;
        }

        // 构建面包屑路径
        const pathChain = this.buildPathChain(currentRoute);

        // 转换为面包屑项
        pathChain.forEach((route, index) => {
            const isLast = index === pathChain.length - 1;
            breadcrumbs.push({
                title: route.title,
                path: isLast ? undefined : route.path, // 最后一项不可点击
                // icon 将在组件中根据 iconType 生成
            });
        });

        return breadcrumbs;
    }

    /**
     * 查找路径配置
     */
    private findRouteConfig(pathname: string): RouteConfig | null {
        // 精确匹配
        if (ROUTE_CONFIG[pathname]) {
            return ROUTE_CONFIG[pathname];
        }

        // 模糊匹配（用于动态路由）
        const segments = pathname.split('/').filter(Boolean);

        // 尝试匹配父路径
        for (let i = segments.length; i > 0; i--) {
            const testPath = '/' + segments.slice(0, i).join('/');
            if (ROUTE_CONFIG[testPath]) {
                return ROUTE_CONFIG[testPath];
            }
        }

        return null;
    }

    /**
     * 构建路径链
     */
    private buildPathChain(route: RouteConfig): RouteConfig[] {
        const chain: RouteConfig[] = [];
        let current: RouteConfig | null = route;

        while (current) {
            chain.unshift(current);
            current = current.parent ? ROUTE_CONFIG[current.parent] : null;
        }

        return chain;
    }

    /**
     * 添加自定义路由配置
     */
    addRouteConfig(path: string, config: Omit<RouteConfig, 'path'>): void {
        ROUTE_CONFIG[path] = {
            path,
            ...config,
        };
    }

    /**
     * 获取所有路由配置
     */
    getAllRoutes(): Record<string, RouteConfig> {
        return { ...ROUTE_CONFIG };
    }

    /**
     * 根据路径获取页面标题
     */
    getPageTitle(pathname: string): string {
        const route = this.findRouteConfig(pathname);
        return route?.title || '未知页面';
    }

    /**
     * 检查路径是否存在
     */
    isValidPath(pathname: string): boolean {
        return this.findRouteConfig(pathname) !== null;
    }
}

// 创建单例实例
export const breadcrumbService = new BreadcrumbService();

export default breadcrumbService;