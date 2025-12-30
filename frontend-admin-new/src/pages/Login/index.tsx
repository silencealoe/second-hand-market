import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, DashboardOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/services';
import { LoginForm } from '@/types';
import Logo from '@/components/Logo';
import './index.less';

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const onFinish = async (values: LoginForm) => {
        setLoading(true);
        try {
            const response = await login(values);
            console.log('登录响应:', response);

            // 接口返回的有效数据在 data 属性中
            const { data } = response;
            if (data && data.token) {
                authLogin(data.token, data.user);
                message.success('登录成功');
                navigate('/dashboard');
            } else {
                message.error('登录失败：未获取到登录令牌');
            }
        } catch (error) {
            message.error('登录失败，请检查账号密码');
            console.error('登录错误:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* 背景装饰 */}
            <div className="login-background">
                <div className="bg-decoration bg-decoration-1"></div>
                <div className="bg-decoration bg-decoration-2"></div>
                <div className="bg-decoration bg-decoration-3"></div>
            </div>

            {/* 左侧信息区域 */}
            <div className="login-info">
                <div className="info-content">
                    <div className="logo-section">
                        <Logo size="large" />
                    </div>

                    <Paragraph className="system-description">
                        专业的二手商品交易平台管理后台，提供全面的商品管理、订单处理、
                        用户管理和数据分析功能，助力打造高效的电商运营体验。
                    </Paragraph>

                    <div className="feature-list">
                        <div className="feature-item">
                            <DashboardOutlined className="feature-icon" />
                            <div className="feature-text">
                                <div className="feature-title">实时数据监控</div>
                                <div className="feature-desc">全方位的业务数据分析与可视化展示</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <ShopOutlined className="feature-icon" />
                            <div className="feature-text">
                                <div className="feature-title">智能商品管理</div>
                                <div className="feature-desc">高效的商品上架、分类和库存管理</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <UserOutlined className="feature-icon" />
                            <div className="feature-text">
                                <div className="feature-title">用户体验优化</div>
                                <div className="feature-desc">完善的用户管理和客户服务体系</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 右侧登录表单 */}
            <div className="login-form-section">
                <Card className="login-card">
                    <div className="card-header">
                        <Title level={3} className="login-title">
                            管理员登录
                        </Title>
                        <Paragraph className="login-subtitle">
                            请使用管理员账号登录系统
                        </Paragraph>
                    </div>

                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                        className="login-form"
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: '请输入管理员账号!' }]}
                        >
                            <Input
                                prefix={<UserOutlined className="input-icon" />}
                                placeholder="管理员账号"
                                className="login-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="input-icon" />}
                                placeholder="密码"
                                className="login-input"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="login-button"
                            >
                                {loading ? '登录中...' : '立即登录'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="login-footer">
                        <Paragraph className="footer-text">
                            © 2025 智慧商城管理系统 - 安全可靠的管理平台
                        </Paragraph>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;