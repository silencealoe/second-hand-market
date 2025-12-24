// 运行时配置
import { getProfile } from '@/services/admin/auth';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState() {
  const initialState = {
    currentUser: null,
    isLogin: false,
  };

  try {
    // 尝试获取用户信息
    const response = await getProfile();
    if (response.success && response.data) {
      initialState.currentUser = response.data;
      initialState.isLogin = true;
    }
  } catch (error) {
    // 获取用户信息失败，说明未登录
    console.log('未登录');
  }

  return initialState;
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
      items: [
        {
          path: '/home',
          name: '数据仪表盘',
          icon: 'dashboard',
        },
        {
          path: '/products',
          name: '商品管理',
          icon: 'shopping-cart',
        },
        {
          path: '/users',
          name: '用户管理',
          icon: 'user',
        },
        {
          path: '/orders',
          name: '订单管理',
          icon: 'file-text',
        },
        {
          path: '/system',
          name: '系统设置',
          icon: 'setting',
        },
      ],
    },
    title: '二手商城后台管理系统',
    rightRender: () => {
      return <div style={{ marginRight: 20 }}>管理员</div>;
    },
  };
};
