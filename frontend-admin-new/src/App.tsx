import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import PrivateRoute from '@/components/PrivateRoute';
import MainLayout from '@/components/Layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
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

                        {/* 占位路由 - 用户管理 */}
                        <Route
                            path="/users"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            <h2>用户管理</h2>
                                            <p>功能开发中...</p>
                                        </div>
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />

                        {/* 占位路由 - 系统管理 */}
                        <Route
                            path="/system"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            <h2>系统管理</h2>
                                            <p>功能开发中...</p>
                                        </div>
                                    </MainLayout>
                                </PrivateRoute>
                            }
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