import { getProfile } from '@/services/admin/auth';

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
    
    const response = await getProfile();
    if (response.success && response.data) {
      initialState.currentUser = response.data;
      initialState.isLogin = true;
    }
  } catch (error) {
    console.log('未登录');
  }

  return initialState;
}

// 最简化的布局配置
export const layout = {
  title: '二手商城后台管理系统',
  logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
};
