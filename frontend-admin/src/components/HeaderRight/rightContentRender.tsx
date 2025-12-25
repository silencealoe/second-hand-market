import React from 'react';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu, message } from 'antd';
import { logout } from '@/services/admin/auth';

/**
 * 头部右侧内容渲染函数
 * @param initialState 应用初始状态
 * @returns 头部右侧内容React组件
 */
export default function rightContentRender(initialState) {
  const currentUser = initialState?.currentUser;
  if (!currentUser) {
    return null;
  }

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      window.location.href = '/login';
      message.success('退出登录成功');
    } catch (error) {
      message.error('退出登录失败');
      console.error('退出登录错误:', error);
    }
  };

  // 定义用户信息菜单
  const menuItems = [
    {
      key: 'logout',
      label: (
        <span>
          <LogoutOutlined /> 退出登录
        </span>
      ),
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: (e) => {
          if (e.key === 'logout') {
            handleLogout();
          }
        },
      }}
      trigger={['hover']}
      placement="bottomRight"
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
        <span style={{ color: '#fff' }}>{currentUser.realName || currentUser.username}</span>
      </div>
    </Dropdown>
  );
}