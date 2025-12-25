import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  layout: {
    title: '二手商城后台管理系统',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  },
  mfsu: false,
  initialState: {},
  request: {},
  // 代理配置，将/api路径代理到后端3000端口
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  },
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      name: '登录',
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      name: '首页',
      path: '/home',
      component: '@/pages/Home',
    },
  ],
  npmClient: 'pnpm',
});

