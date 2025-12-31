# 用户管理功能改进设计文档

## 架构设计

### 整体架构
```
Frontend (React + Ant Design)
    ↓ HTTP Requests
Backend (NestJS)
    ↓ Database Queries  
Database (MySQL/PostgreSQL)
```

### 组件架构
```
UserManagement (主容器)
├── AdminUserManagement (管理员用户管理)
├── ShopUserManagement (商城用户管理)
└── Common Components
    ├── UserTable (用户表格)
    ├── UserForm (用户表单)
    └── UserSearch (用户搜索)
```

## 数据流设计

### API响应数据流
```typescript
// 后端响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 分页数据格式
interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 完整响应示例
{
  code: 200,
  data: {
    data: [
      { id: 1, username: "admin", ... },
      { id: 2, username: "user", ... }
    ],
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

### 前端数据处理流程
```typescript
// 1. API调用
const response = await getAdminUsers(params);

// 2. 数据验证和提取
if (response?.code === 200 && response.data) {
  const pageData = response.data;
  const userData = Array.isArray(pageData.data) ? pageData.data : [];
  const totalCount = typeof pageData.total === 'number' && !isNaN(pageData.total) ? pageData.total : 0;
  
  // 3. 数据过滤和验证
  const validUsers = userData.filter(user => user && typeof user === 'object' && user.id);
  
  // 4. 状态更新
  setUsers(validUsers);
  setTotal(totalCount);
}
```

## 错误处理设计

### 前端错误处理策略
```typescript
// 1. API级别错误处理
try {
  const response = await apiCall();
  // 处理成功响应
} catch (error) {
  // 记录错误日志
  console.error('API Error:', error);
  
  // 设置安全的默认值
  setUsers([]);
  setTotal(0);
  
  // 用户友好的错误提示
  message.error('获取数据失败，请稍后重试');
}

// 2. 组件级别错误边界
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>出现错误，请刷新页面重试</div>;
    }
    return this.props.children;
  }
}
```

### 后端错误处理策略
```typescript
// 全局异常过滤器
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    let status = 500;
    let message = '服务器内部错误';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
      }
    }
    
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
```

## Table组件优化设计

### 数据安全处理
```typescript
// 确保dataSource始终是有效数组
const safeDataSource = useMemo(() => {
  if (!Array.isArray(users)) {
    console.warn('Users data is not an array:', users);
    return [];
  }
  
  // 过滤无效数据
  return users.filter(user => {
    if (!user || typeof user !== 'object') {
      console.warn('Invalid user object:', user);
      return false;
    }
    
    if (!user.id) {
      console.warn('User missing id:', user);
      return false;
    }
    
    return true;
  });
}, [users]);

// 安全的rowKey生成
const getRowKey = useCallback((record: any, index?: number) => {
  if (record?.id) {
    return String(record.id);
  }
  
  console.warn('Record missing id, using index:', record, index);
  return `row-${index || Math.random()}`;
}, []);
```

### 分页组件优化
```typescript
const paginationConfig = useMemo(() => ({
  current: currentPage,
  pageSize: pageSize,
  total: total || 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => {
    const start = range?.[0] || 0;
    const end = range?.[1] || 0;
    return `第 ${start}-${end} 条/共 ${total || 0} 条`;
  },
  onChange: (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  },
}), [currentPage, pageSize, total]);
```

## 登录错误处理设计

### 后端认证逻辑
```typescript
// AdminAuthService.login方法
async login(username: string, password: string) {
  // 1. 查找用户
  const user = await this.adminUserRepository.findOne({
    where: { username },
    relations: ['role'],
  });

  if (!user) {
    throw new UnauthorizedException('账号或密码错误');
  }

  // 2. 检查用户状态（在密码验证之前）
  if (user.status === 0) {
    throw new UnauthorizedException('账号已被禁用');
  }

  // 3. 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('账号或密码错误');
  }

  // 4. 生成token并返回
  return { token, user };
}
```

### 前端错误处理
```typescript
// Login组件错误处理
const handleLogin = async (values: LoginForm) => {
  try {
    const response = await login(values);
    // 处理成功登录
  } catch (error: any) {
    console.error('登录错误:', error);

    // 优先使用后端返回的具体错误信息
    let errorMessage = '登录失败，请检查账号密码';

    if (error.response?.data?.message) {
      // 后端返回的具体错误信息
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      // HTTP 401状态码的通用处理
      errorMessage = '账号或密码错误，请重新输入';
    } else if (error.message) {
      // 网络错误等其他错误
      errorMessage = error.message;
    }

    message.error(errorMessage);
  }
};
```

### 拦截器配置
```typescript
// 响应错误拦截器
const handleApiError = (error: AxiosError) => {
  const url = error.config?.url;

  // 登录接口的错误由页面自己处理，不进行统一处理
  if (url?.includes('/admin/auth/login')) {
    return; // 跳过统一错误处理
  }

  // 其他接口的统一错误处理
  const status = error.response?.status;
  switch (status) {
    case 401:
      // Token过期，跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
    case 403:
      message.error('权限不足');
      break;
    default:
      message.error('请求失败');
  }
};
```

## 性能优化设计

### 前端性能优化
```typescript
// 1. 使用React.memo优化组件渲染
const UserTable = React.memo(({ users, loading, onEdit, onDelete }) => {
  // 组件实现
});

// 2. 使用useMemo缓存计算结果
const filteredUsers = useMemo(() => {
  return users.filter(user => 
    user.username.includes(searchText) ||
    user.realName?.includes(searchText)
  );
}, [users, searchText]);

// 3. 使用useCallback缓存事件处理函数
const handleEdit = useCallback((user: AdminUser) => {
  setEditingUser(user);
  setIsModalVisible(true);
}, []);

// 4. 虚拟滚动处理大量数据
const VirtualTable = ({ dataSource, columns }) => {
  return (
    <Table
      components={{
        body: {
          wrapper: VirtualizedTableBody,
        },
      }}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      scroll={{ y: 400 }}
    />
  );
};
```

### 后端性能优化
```typescript
// 1. 数据库查询优化
async findAdminUsers(query: UserPageQuery) {
  const queryBuilder = this.adminUserRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .select([
      'user.id',
      'user.username', 
      'user.realName',
      'user.phone',
      'user.avatar',
      'user.status',
      'user.lastLoginAt',
      'user.createdAt',
      'role.id',
      'role.name',
      'role.isSuper'
    ]);

  // 添加搜索条件
  if (query.search) {
    queryBuilder.andWhere(
      '(user.username LIKE :search OR user.realName LIKE :search)',
      { search: `%${query.search}%` }
    );
  }

  // 添加分页
  const offset = (query.page - 1) * query.limit;
  queryBuilder.skip(offset).take(query.limit);

  // 执行查询
  const [data, total] = await queryBuilder.getManyAndCount();
  
  return {
    data,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit)
  };
}

// 2. 缓存优化
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5分钟缓存
async getRoles() {
  return this.roleService.findAll();
}
```

## 测试设计

### 单元测试
```typescript
// 前端组件测试
describe('AdminUserManagement', () => {
  it('should handle empty user data safely', () => {
    const { getByText } = render(
      <AdminUserManagement onUserCountChange={jest.fn()} />
    );
    
    // 验证空数据状态
    expect(getByText('暂无数据')).toBeInTheDocument();
  });

  it('should display error message on API failure', async () => {
    // Mock API失败
    jest.spyOn(userService, 'getAdminUsers').mockRejectedValue(new Error('API Error'));
    
    const { getByText } = render(
      <AdminUserManagement onUserCountChange={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(getByText('获取用户列表失败')).toBeInTheDocument();
    });
  });
});

// 后端服务测试
describe('AdminAuthService', () => {
  it('should throw specific error for disabled account', async () => {
    const disabledUser = { ...mockUser, status: 0 };
    jest.spyOn(repository, 'findOne').mockResolvedValue(disabledUser);
    
    await expect(
      service.login('testuser', 'password')
    ).rejects.toThrow('账号已被禁用');
  });
});
```

### 集成测试
```typescript
// API集成测试
describe('User Management API', () => {
  it('should return paginated user list', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      code: 200,
      data: {
        data: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number)
      }
    });
  });
});
```

## 部署设计

### 前端部署
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 后端部署
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 监控和日志设计

### 前端监控
```typescript
// 错误监控
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  // 发送错误报告到监控系统
});

// 性能监控
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Performance:', entry);
  });
});
observer.observe({ entryTypes: ['navigation', 'resource'] });
```

### 后端监控
```typescript
// 日志记录
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`${request.method} ${request.url} - ${duration}ms`);
      })
    );
  }
}
```

## 安全设计

### 前端安全
- XSS防护：使用dangerouslySetInnerHTML时进行HTML转义
- CSRF防护：使用CSRF token
- 敏感信息保护：不在前端存储敏感数据

### 后端安全
- 输入验证：使用DTO和验证管道
- 权限控制：基于角色的访问控制
- 日志记录：记录所有敏感操作