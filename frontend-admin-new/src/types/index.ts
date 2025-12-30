// 用户认证相关类型
export interface User {
    id: string;
    username: string;
    realName: string;
    avatar?: string;
    role: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface LoginForm {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

// 主题相关类型
export type ThemeMode = 'dark' | 'light';

export interface ThemeConfig {
    mode: ThemeMode;
    primaryColor: string;
    borderRadius: number;
}

// 仪表板数据类型
export interface MetricsData {
    dailyOrders: number;
    growthRate: number;
    todayRevenue: number;
    totalUsers: number;
    activeProducts: number;
}

export interface ChartDataItem {
    date: string;
    value: number;
}

export interface CategoryData {
    name: string;
    value: number;
    percentage: number;
}

export interface PaymentData {
    name: string;
    value: number;
    percentage: number;
}

export interface ChartData {
    salesData: ChartDataItem[];
    categoryData: CategoryData[];
    paymentData: PaymentData[];
}