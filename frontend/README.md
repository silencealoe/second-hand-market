# 二手交易市场前端

基于 Vue3 + Vite + TypeScript + NutUI 开发的移动端二手交易市场前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 的超集
- **Vue Router** - Vue.js 官方路由管理器
- **Axios** - 基于 Promise 的 HTTP 客户端
- **NutUI** - 京东风格的移动端组件库

## 功能特性

- ✅ 用户登录/注册
- ✅ 商品列表（无限滚动瀑布流）
- ✅ 商品详情页
- ✅ 发布商品
- ✅ 个人中心
- ✅ 底部导航栏
- ✅ 评论功能

## 项目结构

```
frontend/
├── src/
│   ├── api/           # API 接口封装
│   │   ├── request.ts # Axios 封装
│   │   ├── users.ts   # 用户相关接口
│   │   ├── products.ts # 商品相关接口
│   │   └── comments.ts # 评论相关接口
│   ├── components/    # 公共组件
│   │   └── TabBar.vue # 底部导航栏
│   ├── layouts/       # 布局组件
│   │   └── MainLayout.vue
│   ├── router/        # 路由配置
│   │   └── index.ts
│   ├── types/         # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/         # 工具函数
│   │   └── auth.ts    # 认证相关工具
│   ├── views/         # 页面组件
│   │   ├── Login.vue      # 登录页
│   │   ├── Register.vue   # 注册页
│   │   ├── Products.vue   # 商品列表页
│   │   ├── ProductDetail.vue # 商品详情页
│   │   ├── Publish.vue    # 发布商品页
│   │   └── Profile.vue   # 个人中心页
│   ├── App.vue        # 根组件
│   ├── main.ts        # 入口文件
│   └── style.css      # 全局样式
├── index.html         # HTML 模板
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置
```

## 安装依赖

```bash
cd frontend
npm install
# 或
pnpm install
# 或
yarn install
```

## 开发

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 预览构建结果

```bash
npm run preview
```

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 6.0.0

## API 配置

前端默认通过代理访问后端 API，代理配置在 `vite.config.ts` 中：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

确保后端服务运行在 `http://localhost:3000`。

## 注意事项

1. 确保后端服务已启动并运行在 `http://localhost:3000`
2. 首次使用需要先注册账号
3. 发布商品需要登录
4. 图片 URL 需要是有效的网络地址

