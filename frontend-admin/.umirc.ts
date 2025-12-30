import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {
    // 启用 Ant Design 5.x 的 CSS-in-JS
    style: 'less',
    theme: {
      // 基础主题配置，将由 ThemeProvider 动态覆盖
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
      },
    },
  },
  access: {},
  model: {},
  mfsu: false,
  initialState: {},
  layout: {
    // 禁用默认布局，使用自定义布局
    name: '二手商城后台管理系统',
    locale: false,
  },
  styledComponents: {},
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
      redirect: '/home',
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
    {
      name: '主题演示',
      path: '/theme-demo',
      component: '@/pages/ThemeDemo',
    },
    {
      name: '布局测试',
      path: '/layout-test',
      component: '@/pages/LayoutTest',
    },
  ],
  npmClient: 'pnpm',
  // 启用 Less 支持
  lessLoader: {
    modifyVars: {
      // 可以在这里定义全局 Less 变量
      '@primary-color': '#1890ff',
    },
    javascriptEnabled: true,
  },
});

