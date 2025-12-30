import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { logout as logoutApi } from '@/services/auth';

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
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
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
    });


    // 初始化认证状态
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');

        if (token && userInfo) {
            try {
                const user = JSON.parse(userInfo);
                setAuthState({
                    user,
                    token,
                    isAuthenticated: true,
                });
            } catch (error) {
                console.error('Failed to parse user info:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
            }
        }
    }, []);

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
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};