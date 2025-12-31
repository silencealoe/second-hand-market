import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import PrivateRoute from '@/components/PrivateRoute';
import MainLayout from '@/components/Layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/UserManagement';
import '@/styles/variables.less';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* 登录页面 */}
                        <Route path="/login" element={<Login />} />

                        {/* 受保护的路由 */}
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <Dashboard />
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />

                        {/* 系统管理 - 用户管理 */}
                        <Route
                            path="/system/users"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <UserManagement />
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />

                        {/* 系统管理 - 系统设置 */}
                        <Route
                            path="/system/settings"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            <h2>系统设置</h2>
                                            <p>功能开发中...</p>
                                        </div>
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />

                        {/* 系统管理根路径重定向到用户管理 */}
                        <Route
                            path="/system"
                            element={<Navigate to="/system/users" replace />}
                        />

                        {/* 兼容旧的用户管理路径，重定向到新路径 */}
                        <Route
                            path="/users"
                            element={<Navigate to="/system/users" replace />}
                        />

                        {/* 默认重定向 */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* 404页面 */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;