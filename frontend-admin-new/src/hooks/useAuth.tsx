import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { logout as logoutApi, getUserInfo } from '@/services/auth';

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean; // 添加加载状态
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [authState, setAuthState] = useState<AuthState>(() => {
        // 在初始化时同步读取 localStorage，避免异步导致的认证状态延迟
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');

        if (token && userInfo) {
            try {
                const user = JSON.parse(userInfo);
                return {
                    user,
                    token,
                    isAuthenticated: true,
                };
            } catch (error) {
                console.error('Failed to parse user info:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
            }
        }

        return {
            user: null,
            token: null,
            isAuthenticated: false,
        };
    });

    // 验证 token 有效性
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (token && authState.isAuthenticated) {
                setIsLoading(true);
                try {
                    // 调用用户信息接口验证 token 有效性
                    await getUserInfo();
                    console.log('Token 验证成功');
                } catch (error) {
                    console.error('Token 验证失败，清除认证状态:', error);
                    // Token 无效，清除认证状态
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    setAuthState({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        // 只在有认证状态时验证 token
        if (authState.isAuthenticated) {
            validateToken();
        }
    }, []); // 只在组件挂载时执行一次

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(user));
        setAuthState({
            user,
            token,
            isAuthenticated: true,
        });
    };

    const logout = async () => {
        try {
            // 调用退出登录接口
            await logoutApi();
        } catch (error) {
            console.error('退出登录接口调用失败:', error);
            // 即使接口调用失败，也要清除本地存储
        } finally {
            // 清除本地存储和状态
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
            });
        }
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};