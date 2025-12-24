# NestJS AOP机制实现文档

## 已实现的AOP组件

### 1. Guard (守卫) - 接口鉴权

**文件位置**: `src/common/guards/`

#### JwtAuthGuard
- 基础JWT认证守卫
- 验证Bearer Token的有效性
- 将用户信息注入到请求对象中

#### EnhancedJwtAuthGuard
- 增强版JWT认证守卫
- 支持`@Public()`装饰器，允许公开访问特定接口
- 使用Reflector读取元数据

### 2. Interceptor (拦截器) - 请求日志

**文件位置**: `src/common/interceptors/logging.interceptor.ts`

#### LoggingInterceptor
- 记录请求开始和完成时间
- 记录请求方法、URL、IP、User-Agent等信息
- 记录响应状态码和请求耗时

### 3. Pipe (管道) - 参数校验

**文件位置**: `src/common/pipes/custom-validation.pipe.ts`

#### CustomValidationPipe
- 增强的参数验证管道
- 支持class-validator验证规则
- 提供更友好的错误信息格式
- 支持嵌套对象验证

### 4. ExceptionFilter (异常过滤器) - 全局异常处理

**文件位置**: `src/common/filters/global-exception.filter.ts`

#### GlobalExceptionFilter
- 全局异常捕获和处理
- 统一错误响应格式
- 记录错误日志
- 支持HTTP异常和普通错误的处理

### 5. Decorator (装饰器) - 自定义元数据

**文件位置**: `src/common/decorators/public.decorator.ts`

#### @Public()
- 标记接口为公开访问
- 绕过JWT认证守卫

## 配置说明

### 全局配置 (main.ts)

```typescript
// 全局验证管道
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));

// 全局日志拦截器
app.useGlobalInterceptors(new LoggingInterceptor());

// 全局异常过滤器
app.useGlobalFilters(new GlobalExceptionFilter());
```

### 模块配置 (app.module.ts)

```typescript
// JWT模块配置
JwtModule.register({
  global: true,
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: '7d' },
}),

// 全局Guard配置
providers: [
  {
    provide: APP_GUARD,
    useClass: EnhancedJwtAuthGuard,
  },
  Reflector,
],
```

## 使用示例

### 公开接口 (无需认证)

```typescript
@Post('login')
@Public()
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### 受保护接口 (需要认证)

```typescript
@Post()
create(@Body(CustomValidationPipe) createDto: CreateDto) {
  return this.service.create(createDto);
}
```

### 控制器级别拦截器

```typescript
@Controller('products')
@UseInterceptors(LoggingInterceptor)
export class ProductsController {
  // 控制器方法
}
```

## 功能特性

### 接口鉴权
- 基于JWT的Bearer Token认证
- 支持公开接口标记
- 自动用户信息注入

### 参数校验
- 支持DTO类验证
- 友好的错误信息
- 嵌套对象验证支持

### 请求监控
- 完整的请求日志记录
- 性能监控（请求耗时）
- 用户行为追踪

### 异常处理
- 统一的错误响应格式
- 详细的错误日志记录
- 生产环境友好的错误信息

## 安全特性

1. **JWT安全**: 使用环境变量配置JWT密钥
2. **参数过滤**: 自动过滤非白名单字段
3. **错误信息**: 生产环境隐藏敏感错误信息
4. **请求验证**: 严格的参数类型验证

## 扩展建议

1. **角色权限**: 可以基于用户角色实现更细粒度的权限控制
2. **限流保护**: 添加请求频率限制拦截器
3. **缓存拦截**: 实现响应缓存拦截器
4. **性能监控**: 添加更详细的性能监控指标

## 测试建议

1. 测试公开接口是否无需认证
2. 测试受保护接口的认证要求
3. 测试参数验证的错误处理
4. 测试异常过滤器的错误响应格式