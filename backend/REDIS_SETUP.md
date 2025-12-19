# Redis 安装和配置说明

## 问题说明

如果后端服务启动时出现以下错误：
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

这表示 Redis 服务未启动或未正确配置。

## 解决方案

### 方案 1：安装并启动 Redis（推荐）

#### Windows 系统

1. **下载 Redis for Windows**
   - 访问：https://github.com/microsoftarchive/redis/releases
   - 下载最新版本的 `Redis-x64-*.zip`
   - 解压到 `C:\Redis` 目录

2. **启动 Redis 服务**
   ```powershell
   cd C:\Redis
   redis-server.exe
   ```

3. **或者安装为 Windows 服务（可选）**
   ```powershell
   redis-server --service-install
   redis-server --service-start
   ```

#### Linux/macOS 系统

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# macOS (使用 Homebrew)
brew install redis
brew services start redis

# 或者手动启动
redis-server
```

### 方案 2：使用降级方案（无需 Redis）

如果暂时无法安装 Redis，系统会自动使用**定时任务**作为降级方案：

- ✅ 服务可以正常启动
- ✅ 订单创建功能正常
- ✅ 超时订单会自动取消（通过定时任务，每秒检查一次）
- ⚠️ 性能略低于 Redis 过期事件（但功能完全正常）

**注意**：降级方案会在日志中显示警告信息，但不影响功能使用。

## Redis 配置（可选，用于启用过期事件）

如果已安装 Redis，建议启用 keyspace notifications 以获得更好的性能：

1. **编辑 Redis 配置文件**
   - Windows: 编辑 `redis.windows.conf`
   - Linux: 编辑 `/etc/redis/redis.conf`
   - macOS: 编辑 `/usr/local/etc/redis.conf`

2. **找到并修改以下配置**
   ```conf
   # 取消注释并修改为：
   notify-keyspace-events Ex
   ```

3. **重启 Redis 服务**
   ```bash
   # Windows
   redis-server --service-stop
   redis-server --service-start

   # Linux
   sudo systemctl restart redis-server

   # macOS
   brew services restart redis
   ```

## 验证 Redis 连接

启动后端服务后，查看日志：

- ✅ **Redis 连接成功**：会看到 `Redis 过期事件订阅成功`
- ⚠️ **Redis 不可用（使用降级方案）**：会看到 `Redis 连接失败，将使用定时任务作为降级方案`

两种方案都能正常工作，只是性能略有差异。

## 环境变量配置

在 `backend/.env` 文件中配置 Redis 连接地址：

```env
# Redis 连接地址（默认：redis://127.0.0.1:6379）
REDIS_URL=redis://127.0.0.1:6379

# 如果 Redis 在其他服务器，可以这样配置：
# REDIS_URL=redis://your-redis-server:6379
# REDIS_URL=redis://:password@your-redis-server:6379
```

## 总结

- **有 Redis**：使用 Redis 过期事件，性能最佳
- **无 Redis**：自动使用定时任务降级方案，功能正常
- **两种方案都支持**：订单超时自动取消功能

无需担心 Redis 连接问题，系统会自动处理！

