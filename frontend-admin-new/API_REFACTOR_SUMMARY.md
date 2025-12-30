# API 服务重构总结

## 重构概述

成功将 services 文件夹下的 axios 拦截器拆分到单独文件中，实现了模块化的 API 服务架构。

## 重构前后对比

### 重构前
```
src/services/
├── auth.ts         # 包含重复的 axios 配置和拦截器
└── dashboard.ts    # 包含重复的 axios 配置和拦截器
```

每个服务文件都包含相同的 axios 实例创建和拦截器配置代码，存在大量重复。

### 重构后
```
src/services/
├── request.ts      # 统一的 axios 配置和拦截器
├── auth.ts         # 纯净的认证 API 方法
├── dashboard.ts    # 纯净的仪表板 API 方法
├── user.ts         # 用户管理 API 方法
├── system.ts       # 系统管理 API 方法
├── index.ts        # 统一导出入口
└── README.md       # 详细的使用指南
```

## 核心改进

### 1. 统一的 axios 配置 (`request.ts`)

**多种专用实例**:
- `apiRequest`: 默认 API 实例
- `uploadRequest`: 文件上传专用（30s 超时）
- `exportRequest`: 数据导出专用（60s 超时，blob 响应）
- `publicRequest`: 公开 API（无需认证）

**智能拦截器**:
- 自动添加 Authorization token
- 统一错误处理（401/403/404/500）
- 开发环境请求日志
- 可配置跳过认证和错误处理

### 2. 模块化 API 服务

**认证服务** (`auth.ts`):
```typescript
export const login = async (loginForm: LoginForm): Promise<LoginResponse>
export const getUserInfo = async ()
```

**仪表板服务** (`dashboard.ts`):
```typescript
export const getCoreMetrics = async (params: { period: string })
export const getSalesTrend = async (params: { period: string })
export const exportSalesTrend = async (params: { period: string })
```

**用户管理服务** (`user.ts`):
```typescript
export const getUserList = async (params: UserListParams)
export const createUser = async (userData: Partial<User>)
export const uploadUserAvatar = async (file: File)
```

**系统管理服务** (`system.ts`):
```typescript
export const getSystemInfo = async (): Promise<SystemInfo>
export const getSystemLogs = async (params: LogQueryParams)
export const updateSystemConfig = async (key: string, value: string)
```

### 3. 统一导出入口 (`index.ts`)

```typescript
// 统一导出所有 API 服务
export * from './auth';
export * from './dashboard';
export * from './user';
export * from './system';
export { apiRequest, uploadRequest, exportRequest, publicRequest } from './request';
```

## 使用方式优化

### 重构前
```typescript
// 每个文件都需要重复配置
import axios from 'axios';
const authApi = axios.create({ /* 重复配置 */ });
authApi.interceptors.request.use(/* 重复代码 */);
authApi.interceptors.response.use(/* 重复代码 */);
```

### 重构后
```typescript
// 方式1: 从统一入口导入
import { login, getUserList, getCoreMetrics } from '@/services';

// 方式2: 从具体模块导入
import { login } from '@/services/auth';

// 方式3: 直接使用 axios 实例
import { apiRequest } from '@/services';
```

## 技术特性

### 1. TypeScript 完整支持
- 所有 API 方法都有完整的类型定义
- 请求参数和响应数据类型安全
- 智能代码提示和错误检查

### 2. 开发体验优化
- 开发环境自动打印请求/响应日志
- 统一的错误处理机制
- 支持请求取消和超时配置

### 3. 生产环境优化
- 自动 token 管理
- 智能错误重定向
- 性能优化的实例配置

## 错误处理机制

### 统一错误处理
```typescript
const handleApiError = (error: AxiosError) => {
  switch (status) {
    case 401: // 自动跳转登录
    case 403: // 权限不足提示
    case 404: // 资源不存在提示
    case 500: // 服务器错误提示
  }
};
```

### 可选的自定义处理
```typescript
// 跳过全局错误处理
const data = await apiRequest.get('/api/data', {
  skipErrorHandler: true
});

// 跳过认证
const data = await apiRequest.get('/public/data', {
  skipAuth: true
});
```

## 扩展性设计

### 1. 易于添加新模块
只需创建新的服务文件并在 index.ts 中导出即可。

### 2. 支持多种实例配置
可以根据不同需求创建专用的 axios 实例。

### 3. 灵活的拦截器系统
支持为特定实例添加额外的拦截器。

## 迁移指南

### 更新导入语句
```typescript
// 旧方式
import { login } from '@/services/auth';
import { getCoreMetrics } from '@/services/dashboard';

// 新方式（推荐）
import { login, getCoreMetrics } from '@/services';
```

### 使用新的实例类型
```typescript
// 文件上传
import { uploadRequest } from '@/services';
const result = await uploadRequest.post('/upload', formData);

// 数据导出
import { exportRequest } from '@/services';
const blob = await exportRequest.get('/export', { params });
```

## 性能优化

### 1. 减少代码重复
- 消除了每个服务文件中的重复 axios 配置
- 统一的拦截器逻辑，减少包体积

### 2. 智能实例管理
- 根据用途使用不同的 axios 实例
- 优化的超时和配置设置

### 3. 开发效率提升
- 统一的 API 入口，减少导入复杂度
- 完整的 TypeScript 支持
- 详细的使用文档和示例

## 总结

本次重构成功实现了：

1. **代码复用**: 将重复的 axios 配置提取到统一文件
2. **模块化**: 按业务功能拆分 API 服务
3. **类型安全**: 完整的 TypeScript 类型定义
4. **开发体验**: 统一导入、智能提示、调试日志
5. **生产就绪**: 完善的错误处理和性能优化
6. **易于扩展**: 清晰的架构设计，便于后续功能添加

新的 API 服务架构为项目提供了更好的可维护性、可扩展性和开发体验。