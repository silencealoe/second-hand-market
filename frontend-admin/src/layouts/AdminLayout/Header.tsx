import React from 'react';
import { Avatar, Dropdown, Menu, message } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/admin/auth';

interface HeaderProps {
  currentUser?: any;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      navigate('/login');
      message.success('退出登录成功');
    } catch (error) {
      message.error('退出登录失败');
      console.error('退出登录错误:', error);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> 个人资料
        </span>
      ),
    },
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

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      handleLogout();
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%', padding: '0 16px' }}>
      <Dropdown
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
        }}
        trigger={['hover']}
        placement="bottomRight"
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <span style={{ color: '#fff' }}>{currentUser.realName || currentUser.username}</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default Header;
