# useEffect 双重执行问题修复

## 问题描述

Dashboard 组件的 useEffect 在初始加载时执行了两次，导致 API 接口被重复调用。

## 根本原因

问题的根本原因是 **React.StrictMode** 在开发模式下的行为：

1. **React.StrictMode** 在 `main.tsx` 中被启用
2. 在开发模式下，StrictMode 会故意让组件渲染两次来帮助检测副作用
3. 这导致 useEffect 被执行两次，从而触发重复的 API 调用

## 解决方案

### 方案1：使用 useRef 防止重复调用（已实施）

通过 `useRef` 跟踪初始加载状态和当前维度值，避免 StrictMode 导致的重复调用：

```typescript
// 用于防止 React.StrictMode 导致的重复调用
const isInitialLoadRef = useRef(true);
const currentDimensionRef = useRef(dimension);

useEffect(() => {
    // 检查是否是真正的 dimension 变化，而不是 StrictMode 导致的重复渲染
    if (isInitialLoadRef.current || currentDimensionRef.current !== dimension) {
        console.log('Dashboard useEffect triggered - dimension:', dimension, 'isInitial:', isInitialLoadRef.current);
        
        // 更新 refs
        isInitialLoadRef.current = false;
        currentDimensionRef.current = dimension;
        
        refreshData();
    }

    // 清理函数 - 在组件卸载或重新渲染时调用
    return () => {
        console.log('Dashboard useEffect cleanup');
    };
}, [dimension]);
```

### 方案2：移除 React.StrictMode（不推荐）

可以从 `main.tsx` 中移除 `<React.StrictMode>`，但这不推荐，因为：
- StrictMode 有助于在开发阶段发现潜在问题
- 生产环境不会有这个问题
- 移除 StrictMode 会失去其带来的开发时检查功能

## 技术细节

### React.StrictMode 的作用

React.StrictMode 在开发模式下会：
1. 故意双重调用函数组件
2. 故意双重调用 useState、useMemo 等 Hook
3. 故意双重调用 useEffect 和其他副作用
4. 检测不安全的生命周期方法
5. 检测过时的 API 使用

### 为什么保留 StrictMode

1. **开发时检查**：帮助发现副作用和不安全的代码
2. **未来兼容性**：为 React 18+ 的并发特性做准备
3. **最佳实践**：React 官方推荐在开发环境使用

### 解决方案的优势

1. **保持 StrictMode**：继续享受开发时检查的好处
2. **防止重复调用**：避免不必要的 API 请求
3. **性能优化**：减少网络请求和服务器负载
4. **用户体验**：避免加载状态闪烁

## 验证方法

1. 打开浏览器开发者工具的 Network 面板
2. 访问 Dashboard 页面
3. 观察 API 调用次数，应该只有一次初始调用
4. 切换时间维度，应该只触发一次新的 API 调用

## 调试信息

添加了控制台日志来跟踪 useEffect 的执行：
- `Dashboard useEffect triggered` - useEffect 执行时的日志
- `Dashboard useEffect cleanup` - useEffect 清理时的日志

在开发模式下，你可能仍然会看到两次日志，但只有第一次会实际执行 API 调用。

## 注意事项

1. 这个修复只影响开发环境，生产环境不会有双重执行问题
2. 如果需要在其他组件中处理类似问题，可以使用相同的 useRef 模式
3. 确保在依赖数组中包含所有相关的状态变量