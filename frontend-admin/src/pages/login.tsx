import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history } from 'umi';
import request from '../utils/request';
import '../index.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  // 处理登录表单提交
  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // 发送登录请求
      const response = await request.post('/api/admin/auth/login', values);
      // 保存 token 到 localStorage
      localStorage.setItem('token', response.token);
      // 登录成功，跳转到仪表盘
      history.push('/');
      message.success('登录成功');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card title="二手商城后台管理系统" className="login-card">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
