# 快速启动指南

## 前置要求

- Node.js 18+ 
- MySQL 8.0+
- npm 或 yarn

## 步骤 1: 安装依赖

```bash
cd backend
npm install
```

## 步骤 2: 创建数据库

登录 MySQL 并创建数据库：

```sql
CREATE DATABASE second_hand_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 步骤 3: 执行 SQL 脚本

```bash
mysql -u root -p second_hand_market < database/schema.sql
```

或者在 MySQL 客户端中直接执行 `database/schema.sql` 文件的内容。

## 步骤 4: 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=second_hand_market
PORT=3000
```

请根据你的实际数据库配置修改上述值。

## 步骤 5: 启动服务

```bash
npm run start:dev
```

## 步骤 6: 访问 API 文档

打开浏览器访问：

```
http://localhost:3000/api
```

你将看到完整的 Swagger API 文档，可以在线测试所有接口。

## 测试接口示例

### 1. 创建用户

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. 创建商品

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "二手iPhone 13",
    "description": "9成新，功能完好",
    "price": 3999.99,
    "original_price": 5999.99,
    "status": "on_sale",
    "category": "电子产品",
    "images": ["https://example.com/image1.jpg"],
    "location": "北京市朝阳区"
  }'
```

### 3. 创建评论

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "user_id": 1,
    "content": "这个商品看起来不错！"
  }'
```

## 常见问题

### 1. 数据库连接失败

- 检查 MySQL 服务是否启动
- 确认 `.env` 文件中的数据库配置正确
- 确认数据库用户有足够的权限

### 2. 端口被占用

修改 `.env` 文件中的 `PORT` 值，或停止占用 3000 端口的其他服务。

### 3. 表不存在错误

确保已执行 `database/schema.sql` 脚本创建所有表。

## 下一步

- 查看 `README.md` 了解完整的 API 文档
- 在 Swagger 文档中测试接口
- 根据需要添加认证和授权功能

