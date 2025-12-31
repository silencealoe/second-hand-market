# 页面刷新退出登录问题修复

## 问题描述

用户在已登录状态下点击浏览器刷新按钮，页面会自动退出到登录页面，需要重新登录。

## 问题原因分析

### 1. 认证状态初始化时序问题

**原始问题**：
- `AuthProvider` 使用 `useState` 初始化认证状态为 `false`
- 使用 `useEffect` 异步从 localStorage 读取认证信息
- `PrivateRoute` 在 localStorage 数据加载完成前就检查认证状态
- 导致用户被错误地重定向到登录页面

### 2. Token 有效性验证缺失

**潜在问题**：
- localStorage 中的 token 可能已过期
- 没有验证 token 的有效性就直接使用
- 过期的 token 会导致后续 API 调用失败

## 解决方案

### 1. 同步初始化认证状态

将 localStorage 的读取从 `useEffect` 移到 `useState` 的初始化函数中：

```typescript
const [authState, setAuthState] = useState<AuthState>(() => {
    // 在初始化时同步读取 localStorage，避免异步导致的认证状态延迟
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
        try {
            const user = JSON.parse(userInfo);
            return {
                user,
                token,
                isAuthenticated: true,
            };
        } catch (error) {
            console.error('Failed to parse user info:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
        }
    }

    return {
        user: null,
        token: null,
        isAuthenticated: false,
    };
});
```

### 2. 添加 Token 有效性验证

在组件挂载时验证 token 的有效性：

```typescript
useEffect(() => {
    const validateToken = async () => {
        const token = localStorage.getItem('token');
        if (token && authState.isAuthenticated) {
            setIsLoading(true);
            try {
                // 调用用户信息接口验证 token 有效性
                await getUserInfo();
                console.log('Token 验证成功');
            } catch (error) {
                console.error('Token 验证失败，清除认证状态:', error);
                // Token 无效，清除认证状态
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                setAuthState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    // 只在有认证状态时验证 token
    if (authState.isAuthenticated) {
        validateToken();
    }
}, []);
```

### 3. 添加加载状态处理

在 `PrivateRoute` 中添加加载状态，防止验证期间的页面闪烁：

```typescript
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // 如果正在验证 token，显示加载状态
    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" tip="验证登录状态..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
```

## 修复效果

### 修复前
1. 页面刷新 → 认证状态初始为 `false` → 立即重定向到登录页
2. 无 token 有效性验证 → 过期 token 导致后续 API 失败

### 修复后
1. 页面刷新 → 同步读取 localStorage → 正确设置认证状态 → 保持登录状态
2. 自动验证 token 有效性 → 过期时自动清除并重定向到登录页
3. 验证期间显示加载状态 → 避免页面闪烁

## 技术细节

### useState 初始化函数

使用函数形式的 `useState` 初始化，确保只在组件首次渲染时执行：

```typescript
const [state, setState] = useState(() => {
    // 这里的代码只在组件首次渲染时执行
    return initialValue;
});
```

### Token 验证策略

- **时机**：组件挂载时验证一次
- **条件**：只在有认证状态时验证
- **失败处理**：清除本地存储和认证状态
- **加载状态**：防止验证期间的 UI 闪烁

### 错误处理

- JSON 解析错误：清除损坏的用户信息
- Token 验证失败：清除认证状态并重定向
- 网络错误：保持当前状态，避免误判

## 测试验证

1. **正常刷新**：登录后刷新页面，应保持登录状态
2. **Token 过期**：手动修改 localStorage 中的 token，刷新后应自动退出
3. **数据损坏**：手动修改 localStorage 中的用户信息，应自动清除并退出
4. **网络异常**：断网情况下刷新，应显示加载状态而不是立即退出

## 注意事项

1. **性能影响**：每次刷新都会调用一次用户信息接口验证 token
2. **网络依赖**：需要网络连接才能验证 token 有效性
3. **缓存策略**：可以考虑添加 token 过期时间缓存，减少验证频率
4. **错误重试**：网络错误时可以考虑重试机制