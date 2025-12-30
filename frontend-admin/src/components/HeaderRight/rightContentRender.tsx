import React from 'react';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu, message } from 'antd';
import { logout } from '@/services/admin/auth';

/**
 * 头部右侧内容渲染函数
 * @param props 组件属性
 * @returns 头部右侧内容React组件
 */
export default function rightContentRender(props: any) {
  // 兼容两种参数传递方式
  console.log('props', props);
  // 正确获取initialState
  const layoutInitialState = props.initialState || props;
  const currentUser = layoutInitialState?.currentUser;
  console.log('currentUser', currentUser);
  
  // 即使没有用户信息，也返回一个占位元素，确保组件始终有返回值
  if (!currentUser) {
    return <div style={{ padding: '0 16px' }}>未登录</div>;
  }

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    try {
      await logout();
      // 清除localStorage中的登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
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
  // return <div>111</div>
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', cursor: 'pointer', backgroundColor: 'red', color: 'white', height: '100%' }}>
      <div>测试显示</div>
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
          <Avatar 
            src={currentUser?.avatar || 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg'} 
            icon={<UserOutlined />} 
            style={{ marginRight: 8 }} 
          />
          <span style={{ color: '#fff' }}>{currentUser?.realName || currentUser?.username}</span>
        </div>
      </Dropdown>
    </div>
  );
}