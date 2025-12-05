# 二手交易系统后端服务

基于 NestJS 框架开发的二手交易系统后端 API 服务。

## 功能特性

- ✅ 用户管理（注册、查询、更新、删除）
- ✅ 商品管理（创建、查询、更新、删除、状态管理）
- ✅ 评论系统（支持评论和回复）
- ✅ RESTful API 设计
- ✅ Swagger API 文档
- ✅ TypeORM 数据库 ORM
- ✅ 数据验证和错误处理

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.0+
- **ORM**: TypeORM
- **API 文档**: Swagger/OpenAPI
- **验证**: class-validator, class-transformer

## 数据库表结构

系统包含以下三个核心表：

1. **users** - 用户表
2. **products** - 商品表（包含价格、状态、图片URL等字段）
3. **comments** - 评论表（支持回复功能）

详细的 SQL 脚本请查看 `database/schema.sql` 文件。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE second_hand_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

执行 SQL 脚本创建表结构：

```bash
mysql -u root -p second_hand_market < database/schema.sql
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=second_hand_market

PORT=3000
```

### 4. 启动服务

开发模式（热重载）：

```bash
npm run start:dev
```

生产模式：

```bash
npm run build
npm run start:prod
```

### 5. 访问 API 文档

启动服务后，访问 Swagger API 文档：

```
http://localhost:3000/api
```

## API 接口说明

### 用户接口 (Users)

- `POST /users` - 创建用户
- `GET /users` - 获取所有用户列表
- `GET /users/:id` - 获取指定用户信息
- `PATCH /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户

### 商品接口 (Products)

- `POST /products` - 创建商品
- `GET /products` - 获取商品列表（支持 status、category、user_id 筛选）
- `GET /products/:id` - 获取商品详情（自动增加浏览次数）
- `PATCH /products/:id` - 更新商品信息
- `DELETE /products/:id` - 删除商品

**商品状态枚举值**:
- `on_sale` - 在售
- `sold` - 已售
- `off_shelf` - 下架

### 评论接口 (Comments)

- `POST /comments` - 创建评论（支持回复）
- `GET /comments` - 获取评论列表（支持 product_id 筛选）
- `GET /comments/:id` - 获取评论详情
- `PATCH /comments/:id` - 更新评论
- `DELETE /comments/:id` - 删除评论

## 项目结构

```
backend/
├── src/
│   ├── users/           # 用户模块
│   │   ├── entities/    # 实体定义
│   │   ├── dto/         # 数据传输对象
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── products/        # 商品模块
│   ├── comments/        # 评论模块
│   ├── app.module.ts    # 应用根模块
│   └── main.ts          # 应用入口
├── database/
│   └── schema.sql       # 数据库表结构 SQL
├── package.json
└── README.md
```

## 开发命令

```bash
# 开发模式启动
npm run start:dev

# 构建项目
npm run build

# 生产模式启动
npm run start:prod

# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test
```

## 注意事项

1. 生产环境请将 `app.module.ts` 中的 `synchronize` 设置为 `false`，使用数据库迁移管理表结构
2. 密码字段目前未加密，生产环境请使用 bcrypt 等库进行加密
3. 图片上传功能需要单独实现，当前仅支持图片 URL
4. 建议添加 JWT 认证中间件保护接口

## License

MIT

