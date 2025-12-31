# 禁用账号登录提示功能测试指南

## 功能概述

当管理员账号被禁用时，用户尝试登录应该收到明确的提示信息"账号已被禁用"，而不是通用的"账号或密码错误"。

## 后端实现

### 1. 账号状态检查 (`backend/src/admin/services/admin-auth.service.ts`)

```typescript
// 检查用户状态
if (user.status === 0) {
  throw new UnauthorizedException('账号已被禁用');
}
```

- ✅ 在密码验证之前检查账号状态
- ✅ 抛出具体的错误信息
- ✅ 使用UnauthorizedException确保返回401状态码

### 2. 全局异常处理 (`backend/src/common/filters/global-exception.filter.ts`)

```typescript
if (exception instanceof HttpException) {
  status = exception.getStatus();
  const exceptionResponse = exception.getResponse();
  
  if (typeof exceptionResponse === 'string') {
    message = exceptionResponse;
  } else if (typeof exceptionResponse === 'object') {
    const responseObj = exceptionResponse as any;
    message = responseObj.message || message;
  }
}
```

- ✅ 正确提取异常信息
- ✅ 返回包含message字段的错误响应

## 前端实现

### 1. 登录错误处理 (`frontend-admin-new/src/pages/Login/index.tsx`)

```typescript
catch (error: any) {
  console.error('登录错误:', error);
  
  // 获取后端返回的具体错误信息
  let errorMessage = '登录失败，请检查账号密码';
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.status === 401) {
    errorMessage = '账号或密码错误，请重新输入';
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  message.error(errorMessage);
}
```

- ✅ 优先使用后端返回的具体错误信息
- ✅ 提供合理的错误信息降级处理
- ✅ 使用Ant Design的message组件显示错误

### 2. 拦截器优化 (`frontend-admin-new/src/services/interceptors.ts`)

```typescript
// 统一错误处理函数
const handleApiError = (error: AxiosError) => {
  const url = error.config?.url;

  // 登录接口的错误由页面自己处理，不进行统一处理
  if (url?.includes('/admin/auth/login')) {
    return;
  }
  
  // ... 其他错误处理
}
```

- ✅ 登录接口错误不被统一拦截
- ✅ 允许登录页面自定义错误处理

## 测试步骤

### 1. 准备测试数据

1. **创建测试管理员账号**：
   - 用户名：`test_admin`
   - 密码：`123456`
   - 状态：启用（status = 1）

2. **禁用测试账号**：
   - 通过用户管理页面将账号状态设置为禁用
   - 或直接在数据库中设置 `status = 0`

### 2. 测试禁用账号登录

1. **访问登录页面**：
   ```
   http://localhost:3000/login
   ```

2. **输入禁用账号信息**：
   - 用户名：`test_admin`
   - 密码：`123456`

3. **点击登录按钮**

4. **验证错误提示**：
   - 应该显示：`账号已被禁用`
   - 不应该显示：`账号或密码错误`

### 3. 测试正常账号登录

1. **启用测试账号**：
   - 将账号状态设置为启用（status = 1）

2. **重新登录**：
   - 使用相同的账号密码
   - 应该能够正常登录

### 4. 测试错误密码

1. **使用错误密码**：
   - 用户名：`test_admin`
   - 密码：`wrong_password`

2. **验证错误提示**：
   - 应该显示：`账号或密码错误`

## 预期结果

### 禁用账号登录
```
❌ 错误提示：账号已被禁用
🔍 控制台日志：
- 登录错误: AxiosError
- error.response.data.message: "账号已被禁用"
- error.response.status: 401
```

### 错误密码登录
```
❌ 错误提示：账号或密码错误
🔍 控制台日志：
- 登录错误: AxiosError
- error.response.data.message: "账号或密码错误"
- error.response.status: 401
```

### 正常登录
```
✅ 成功提示：登录成功
🔄 页面跳转：/dashboard
```

## 调试信息

### 后端日志
```
[AdminAuthService] 检查用户状态: status = 0
[AdminAuthService] 抛出异常: 账号已被禁用
[GlobalExceptionFilter] 异常捕获: POST /admin/auth/login - 状态码: 401 - 错误: 账号已被禁用
```

### 前端日志
```
🚀 API Request: POST /admin/auth/login
❌ API Error: POST /admin/auth/login - 状态码: 401 - 错误: 账号已被禁用
登录错误: AxiosError {
  response: {
    status: 401,
    data: {
      statusCode: 401,
      message: "账号已被禁用",
      timestamp: "2025-01-01T00:00:00.000Z",
      path: "/admin/auth/login"
    }
  }
}
```

## 故障排除

### 1. 错误信息不显示
- 检查全局异常过滤器是否正确配置
- 验证UnauthorizedException是否正确抛出
- 确认前端错误处理逻辑

### 2. 显示通用错误信息
- 检查拦截器是否正确跳过登录接口
- 验证error.response.data.message是否存在
- 确认错误处理的优先级

### 3. 页面跳转到登录页
- 确认拦截器不会处理登录接口的401错误
- 检查handleApiError函数的URL过滤逻辑

## 相关文件

### 后端文件
- `backend/src/admin/services/admin-auth.service.ts` - 认证服务
- `backend/src/common/filters/global-exception.filter.ts` - 全局异常过滤器

### 前端文件
- `frontend-admin-new/src/pages/Login/index.tsx` - 登录页面
- `frontend-admin-new/src/services/interceptors.ts` - 请求拦截器
- `frontend-admin-new/src/services/auth.ts` - 认证服务

## 安全考虑

1. **信息泄露**：
   - 禁用账号提示不会泄露账号是否存在
   - 只有在密码正确的情况下才检查状态

2. **暴力破解**：
   - 保持相同的响应时间
   - 不区分账号不存在和密码错误

3. **日志记录**：
   - 记录禁用账号的登录尝试
   - 便于安全审计和监控