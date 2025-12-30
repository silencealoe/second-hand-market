# API 服务使用指南

## 概述

本项目采用模块化的 API 服务架构，将 axios 拦截器统一管理，并按业务模块拆分 API 服务。

## 文件结构

```
src/services/
├── interceptors.ts # axios 拦截器配置（新增）
├── request.ts      # axios 实例和拦截器配置
├── auth.ts         # 认证相关 API
├── dashboard.ts    # 仪表板相关 API
├── user.ts         # 用户管理相关 API
├── system.ts       # 系统管理相关 API
├── index.ts        # 统一导出
└── README.md       # 使用指南
```

## 核心特性

### 1. 多种 axios 实例

- **apiRequest**: 默认 API 实例，包含认证和错误处理
- **uploadRequest**: 文件上传专用实例，超时时间更长
- **exportRequest**: 数据导出专用实例，支持 blob 响应
- **publicRequest**: 公开 API 实例，不需要认证

### 2. 模块化拦截器（新特性）

- **interceptors.ts**: 独立的拦截器配置文件
- **工厂函数**: 提供可复用的拦截器创建函数
- **灵活配置**: 支持不同场景的拦截器组合
- **易于测试**: 拦截器逻辑独立，便于单元测试

### 3. 统一的拦截器

- **请求拦截器**: 自动添加 Authorization token
- **响应拦截器**: 统一错误处理和响应格式化
- **开发环境日志**: 自动打印请求和响应信息

### 4. 智能错误处理

- **401**: 自动清除 token 并跳转登录页
- **403**: 权限不足提示
- **404**: 资源不存在提示
- **500**: 服务器错误提示

## 使用方法

### 基本用法

```typescript
// 方式1: 从统一入口导入
import { login, getUserList, getCoreMetrics } from '@/services';

// 方式2: 从具体模块导入
import { login } from '@/services/auth';
import { getUserList } from '@/services/user';

// 方式3: 直接使用 axios 实例
import { apiRequest } from '@/services';
const response = await apiRequest.get('/custom-endpoint');
```

### 认证相关

```typescript
import { login, getUserInfo } from '@/services';

// 用户登录
const loginData = await login({ username, password });

// 获取用户信息
const userInfo = await getUserInfo();
```

### 文件上传

```typescript
import { uploadUserAvatar, uploadRequest } from '@/services';

// 使用封装好的上传方法
const result = await uploadUserAvatar(file);

// 或直接使用上传实例
const formData = new FormData();
formData.append('file', file);
const response = await uploadRequest.post('/upload', formData);
```

### 数据导出

```typescript
import { exportSalesTrend, exportRequest } from '@/services';

// 使用封装好的导出方法
const blob = await exportSalesTrend({ period: 'month' });

// 或直接使用导出实例
const blob = await exportRequest.get('/export-data', { params });
```

### 公开 API（无需认证）

```typescript
import { publicRequest } from '@/services';

// 获取公开数据，不需要 token
const data = await publicRequest.get('/public/statistics');
```

## 错误处理

### 全局错误处理

所有 API 请求都会经过统一的错误处理，无需在每个组件中重复处理常见错误。

### 跳过错误处理

如果需要自定义错误处理，可以在请求配置中设置：

```typescript
import { apiRequest } from '@/services';

try {
  const data = await apiRequest.get('/api/data', {
    skipErrorHandler: true
  });
} catch (error) {
  // 自定义错误处理
  console.error('Custom error handling:', error);
}
```

### 跳过认证

对于不需要认证的请求：

```typescript
import { apiRequest } from '@/services';

const data = await apiRequest.get('/public/data', {
  skipAuth: true
});
```

## 开发调试

### 请求日志

在开发环境下，所有 API 请求和响应都会在控制台打印：

```
🚀 API Request: { method: 'GET', url: '/admin/users', params: {...} }
✅ API Response: { method: 'GET', url: '/admin/users', status: 200, data: {...} }
❌ API Error: { method: 'POST', url: '/admin/login', status: 401, message: '...' }
```

### 环境配置

可以通过环境变量配置 API 基础地址：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

## 最佳实践

### 1. 类型定义

为每个 API 服务定义完整的 TypeScript 类型：

```typescript
// 定义请求参数类型
interface UserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 定义响应数据类型
interface User {
  id: string;
  username: string;
  email: string;
}

// API 方法
export const getUserList = async (params: UserListParams): Promise<User[]> => {
  return apiRequest.get('/admin/users', { params });
};
```

### 2. 错误处理

在组件中使用 try-catch 处理业务逻辑错误：

```typescript
const handleSubmit = async (formData) => {
  try {
    await createUser(formData);
    message.success('创建成功');
    // 刷新列表等后续操作
  } catch (error) {
    // 业务逻辑错误处理
    message.error('创建失败，请重试');
  }
};
```

### 3. 加载状态

配合 React 状态管理加载状态：

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await getUserList(params);
    setUsers(data);
  } finally {
    setLoading(false);
  }
};
```

### 4. 请求取消

对于可能被取消的请求，使用 AbortController：

```typescript
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const data = await apiRequest.get('/api/data', {
        signal: controller.signal
      });
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };
  
  fetchData();
  
  return () => controller.abort();
}, []);
```

## 扩展指南

### 拦截器拆分架构

本项目将 axios 拦截器拆分到独立的 `interceptors.ts` 文件中，提供以下优势：

#### 1. 模块化设计
```typescript
// interceptors.ts - 拦截器工厂函数
export const createAuthRequestInterceptor = () => { /* ... */ };
export const createResponseSuccessInterceptor = () => { /* ... */ };
export const setupInterceptors = (instance) => { /* ... */ };

// request.ts - 使用拦截器
import { setupInterceptors } from './interceptors';
const instance = axios.create(config);
setupInterceptors(instance);
```

#### 2. 可复用的拦截器
```typescript
import { 
    createAuthRequestInterceptor,
    createResponseErrorInterceptor 
} from './interceptors';

// 为不同实例配置不同的拦截器组合
const customInstance = axios.create();
customInstance.interceptors.request.use(createAuthRequestInterceptor());
customInstance.interceptors.response.use(null, createResponseErrorInterceptor());
```

#### 3. 便于测试
```typescript
// 可以单独测试拦截器逻辑
import { createAuthRequestInterceptor } from './interceptors';

describe('Auth Request Interceptor', () => {
    it('should add authorization header', () => {
        const interceptor = createAuthRequestInterceptor();
        const config = { headers: {} };
        const result = interceptor(config);
        expect(result.headers.Authorization).toBeDefined();
    });
});
```

### 添加新的业务模块

1. 创建新的服务文件：`src/services/newModule.ts`
2. 定义类型接口和 API 方法
3. 在 `src/services/index.ts` 中导出
4. 在组件中使用

### 自定义 axios 实例

如果需要特殊配置的 axios 实例：

```typescript
import { createApiInstance } from '@/services/request';

export const customRequest = createApiInstance({
  timeout: 5000,
  headers: {
    'Custom-Header': 'value'
  }
});
```

### 添加新的拦截器

可以为特定实例添加额外的拦截器：

```typescript
apiRequest.interceptors.request.use((config) => {
  // 自定义请求处理
  return config;
});

apiRequest.interceptors.response.use((response) => {
  // 自定义响应处理
  return response;
});
```