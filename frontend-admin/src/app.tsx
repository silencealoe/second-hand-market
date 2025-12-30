import { getProfile, logout } from '@/services/admin/auth';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, message } from 'antd';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { EnhancedProLayout } from '@/components/Layout';
import '@/styles/theme.less';

export async function getInitialState() {
  const initialState = {
    currentUser: null,
    isLogin: false
  };

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return initialState;
    }

    // 优先从localStorage获取用户信息
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        initialState.currentUser = parsedUserInfo;
        initialState.isLogin = true;
        return initialState;
      } catch (parseError) {
        console.error('解析用户信息失败:', parseError);
        localStorage.removeItem('userInfo');
      }
    }

    // 如果localStorage中没有用户信息，调用API获取
    const userData = await getProfile();
    console.log('userData', userData);
    if (userData?.data) {
      initialState.currentUser = userData.data;
      initialState.isLogin = true;
    }
  } catch (error) {
    console.log('未登录:', error);
  }

  return initialState;
}

// 最简化的布局配置
// export const layout = {
//   title: '二手商城后台管理系统',
//   logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
//   rightRender: () => <HeaderRight />,
// };

// 布局配置
// export const layout = {
//   // 系统标题
//   title: '二手商城后台管理系统',
//   // 系统logo
//   logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
//   // 布局模式：side（左侧菜单）
//   layout: 'side',
//   // 内容宽度：自适应
//   contentWidth: 'Fluid',
//   // 语言设置
//   locale: 'zh-CN',
//   // 侧边栏宽度
//   siderWidth: 300,
//   // 固定头部
//   fixedHeader: true,
//   // 固定侧边栏
//   fixSiderbar: true,
//   // 断点设置
//   breakpoint: 'lg',
//   // 右侧渲染组件
//   rightContentRender: () => <rightContentRender />,
// };
// 在app.tsx内部定义rightContentRender函数
const rightContentRender = (props: any) => {
  const { initialState } = props;
  console.log('initialState-222', initialState);

  const currentUser = initialState?.currentUser;

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '100%' }}>
      {/* 主题切换器 */}
      <ThemeSwitcher size="middle" type="icon" />

      {currentUser ? (
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
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: 16 }}>
            <Avatar
              src={currentUser?.avatar}
              icon={<UserOutlined />}
              style={{ marginRight: 8 }}
            />
            <span style={{ color: '#fff' }}>{currentUser?.realName || currentUser?.username}</span>
          </div>
        </Dropdown>
      ) : (
        <div style={{ color: '#fff', marginLeft: 16 }}>未登录</div>
      )}
    </div>
  );
};

export const layout: any = (initialState: any) => {
  console.log('initialState--', initialState);
  return {
    // 常用属性
    title: '二手商城后台管理系统',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',

    // 使用自定义布局组件
    layout: false, // 禁用默认布局

    // 自定义渲染整个布局
    childrenRender: (children: any) => {
      // 如果是登录页面，不使用布局
      if (window.location.pathname === '/login') {
        return children;
      }

      return (
        <EnhancedProLayout currentUser={initialState?.currentUser}>
          {children}
        </EnhancedProLayout>
      );
    },

    // 其他属性见：https://procomponents.ant.design/components/layout#prolayout
  };
};

// 根容器包装器，用于提供主题上下文
export function rootContainer(container: any) {
  return (
    <ThemeProvider>
      {container}
    </ThemeProvider>
  );
}
