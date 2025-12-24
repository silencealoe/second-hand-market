import { defineConfig } from '@umijs/max';

export default defineConfig({
  // 项目名称
  title: '二手商城后台管理系统',
  // 路由配置
  routes: [
    {
      path: '/login',
      component: './login',
      layout: false,
    },
    {
      path: '/',
      component: './layouts/index',
      routes: [
        {
          path: '/',
          component: './dashboard',
          name: '数据面板',
        },
      ],
    },
  ],
  // 代理配置，用于开发环境请求后端API
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  },
  // 主题配置
  theme: {
    'primary-color': '#1890ff',
  },
  // 国际化配置
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  // 插件配置
  plugins: [
    '@umijs/preset-react',
  ],
  // TypeScript配置
  typescript: {
    strict: true,
    tsconfigPath: './tsconfig.json',
  },
  // 构建配置
  define: {
    'process.env.NODE_ENV': process.env.NODE_ENV,
  },
});
