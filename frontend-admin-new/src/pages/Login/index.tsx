import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/services';
import { LoginForm } from '@/types';
import './index.less';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const onFinish = async (values: LoginForm) => {
        setLoading(true);
        try {
            const response = await login(values);
            console.log('登录响应:', response);
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
            <Card className="login-card" title="二手商城管理后台">
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入管理员账号!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="管理员账号"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
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
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;