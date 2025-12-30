# 主题系统实现文档

## 概述

本项目实现了一个现代化的主题系统，支持深色/浅色模式切换、动态主题配置和CSS变量应用。主题系统采用模块化设计，易于扩展和维护。

## 功能特性

### ✨ 核心功能
- 🌓 深色/浅色主题切换
- 🔄 跟随系统主题设置
- 🎨 动态CSS变量应用
- 💾 主题配置持久化存储
- 🎯 Ant Design主题集成
- 📱 响应式设计支持
- ✨ 平滑过渡动画

### 🚀 技术特点
- TypeScript类型安全
- React Hooks集成
- UmiJS模型状态管理
- CSS-in-JS支持
- 模块化设计
- 高性能优化

## 文件结构

```
src/
├── types/
│   └── theme.ts                 # 主题类型定义
├── constants/
│   └── theme.ts                 # 主题常量配置
├── services/
│   └── theme.ts                 # 主题服务实现
├── hooks/
│   └── useTheme.ts              # 主题React Hook
├── models/
│   └── theme.ts                 # UmiJS主题状态模型
├── components/
│   ├── ThemeProvider/           # 主题提供者组件
│   │   └── index.tsx
│   └── ThemeSwitcher/           # 主题切换器组件
│       └── index.tsx
├── styles/
│   └── theme.less               # 主题CSS变量定义
└── pages/
    └── ThemeDemo/               # 主题演示页面
        └── index.tsx
```

## 核心组件

### 1. 主题服务 (ThemeService)

主题服务是整个主题系统的核心，负责：
- 主题配置管理
- CSS变量应用
- 本地存储持久化
- 系统主题检测
- 主题变化通知

```typescript
// 使用示例
import themeService from '@/services/theme';

// 获取当前主题
const currentTheme = themeService.getCurrentTheme();

// 设置主题
themeService.setTheme({ mode: 'dark' });

// 切换模式
themeService.toggleMode();
```

### 2. 主题Hook (useTheme)

提供React组件中使用主题的便捷方式：

```typescript
import { useTheme } from '@/hooks/useTheme';

const MyComponent = () => {
  const { theme, setTheme, toggleMode, isDark } = useTheme();
  
  return (
    <div>
      <p>当前模式: {theme.mode}</p>
      <button onClick={toggleMode}>切换主题</button>
    </div>
  );
};
```

### 3. 主题提供者 (ThemeProvider)

包装整个应用，提供主题上下文：

```typescript
// 在app.tsx中使用
export function rootContainer(container: any) {
  return (
    <ThemeProvider>
      {container}
    </ThemeProvider>
  );
}
```

### 4. 主题切换器 (ThemeSwitcher)

用户界面中的主题切换组件：

```typescript
import ThemeSwitcher from '@/components/ThemeSwitcher';

// 图标模式
<ThemeSwitcher type="icon" />

// 按钮模式
<ThemeSwitcher type="button" />
```

## 主题配置

### 默认主题配置

```typescript
// 浅色主题
const lightTheme = {
  mode: 'light',
  primaryColor: '#1890ff',
  borderRadius: 6,
  colorScheme: {
    primary: '#1890ff',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2',
  },
  layout: {
    headerHeight: 64,
    siderWidth: 256,
    contentPadding: 24,
  },
};
```

### CSS变量映射

主题系统使用CSS变量实现动态样式切换：

```css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
  --text-color: #000000d9;
  --bg-color: #ffffff;
  --border-color: #d9d9d9;
  --shadow-color: rgba(0, 0, 0, 0.15);
}

[data-theme='dark'] {
  --primary-color: #177ddc;
  --text-color: #ffffffd9;
  --bg-color: #141414;
  --border-color: #434343;
  /* ... */
}
```

## 使用指南

### 1. 在组件中使用主题

```typescript
import React from 'react';
import { useTheme } from '@/hooks/useTheme';

const MyComponent: React.FC = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <div 
      style={{
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
      }}
    >
      当前主题: {theme.mode}
    </div>
  );
};
```

### 2. 使用CSS变量

```css
.my-component {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}
```

### 3. 自定义主题配置

```typescript
import { useTheme } from '@/hooks/useTheme';

const CustomThemeComponent = () => {
  const { setTheme } = useTheme();
  
  const applyCustomTheme = () => {
    setTheme({
      primaryColor: '#722ed1',
      colorScheme: {
        primary: '#722ed1',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
        info: '#13c2c2',
      },
    });
  };
  
  return <button onClick={applyCustomTheme}>应用自定义主题</button>;
};
```

## 集成说明

### UmiJS集成

主题系统已完全集成到UmiJS项目中：

1. **配置文件更新**: `.umirc.ts`中添加了Ant Design主题配置
2. **根容器包装**: `app.tsx`中使用`rootContainer`包装应用
3. **路由配置**: 添加了主题演示页面路由

### Ant Design集成

主题系统与Ant Design完全兼容：

```typescript
// ThemeProvider中的配置
<ConfigProvider
  theme={{
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: currentTheme.primaryColor,
      borderRadius: currentTheme.borderRadius,
      // ...
    },
  }}
>
  {children}
</ConfigProvider>
```

## 性能优化

1. **懒加载**: 主题服务采用单例模式，避免重复初始化
2. **缓存机制**: 主题配置缓存在localStorage中
3. **批量更新**: CSS变量批量应用，减少DOM操作
4. **事件节流**: 主题变化监听器使用节流机制

## 扩展指南

### 添加新的主题模式

1. 在`constants/theme.ts`中添加新的主题配置
2. 在`styles/theme.less`中添加对应的CSS变量
3. 更新`ThemeSwitcher`组件支持新模式

### 自定义颜色方案

```typescript
// 扩展ColorScheme接口
interface ExtendedColorScheme extends ColorScheme {
  accent: string;
  muted: string;
}

// 添加新的颜色配置
const customColorScheme: ExtendedColorScheme = {
  // ... 现有颜色
  accent: '#ff6b6b',
  muted: '#6c757d',
};
```

## 故障排除

### 常见问题

1. **主题切换不生效**
   - 检查CSS变量是否正确定义
   - 确认ThemeProvider是否正确包装应用

2. **样式不一致**
   - 检查组件是否使用了CSS变量
   - 确认主题配置是否正确传递

3. **性能问题**
   - 检查是否有过多的主题监听器
   - 确认CSS变量应用是否批量进行

### 调试工具

```typescript
// 开启调试模式
localStorage.setItem('theme-debug', 'true');

// 查看当前主题配置
console.log(themeService.getCurrentTheme());

// 监听主题变化
themeService.addListener((theme) => {
  console.log('主题已更新:', theme);
});
```

## 总结

本主题系统提供了完整的深色/浅色模式切换功能，具有以下优势：

- 🎯 **易用性**: 简单的API设计，易于集成和使用
- 🔧 **可扩展性**: 模块化架构，支持自定义扩展
- ⚡ **高性能**: 优化的实现，流畅的用户体验
- 🛡️ **类型安全**: 完整的TypeScript类型定义
- 📱 **响应式**: 支持各种设备和屏幕尺寸

通过这个主题系统，用户可以享受到现代化的界面体验，开发者可以轻松地进行主题定制和扩展。