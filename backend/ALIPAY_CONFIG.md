# 支付宝支付配置说明

本文档说明如何配置支付宝支付功能。

## 配置步骤

### 1. 创建 `.env` 文件

在 `backend` 目录下创建 `.env` 文件（如果不存在），并添加以下配置项：

```env
# ============================================
# 服务器配置
# ============================================
PORT=3000
BASE_URL=http://localhost:3000

# ============================================
# 数据库配置
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=second_hand_market

# ============================================
# JWT 配置
# ============================================
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# ============================================
# 支付宝支付配置
# ============================================
# 支付宝应用ID（APPID）
ALIPAY_APP_ID=your_alipay_app_id

# 支付宝网关地址
# 沙箱环境：https://openapi.alipaydev.com/gateway.do
# 生产环境：https://openapi.alipay.com/gateway.do
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do

# 应用私钥（RSA2私钥）
# 注意：私钥需要去除头尾的 -----BEGIN PRIVATE KEY----- 和 -----END PRIVATE KEY-----
# 并且需要将换行符替换为 \n，或者直接使用单行格式
ALIPAY_PRIVATE_KEY=your_rsa2_private_key

# 支付宝公钥
# 在支付宝开放平台获取支付宝公钥
# 注意：同样需要去除头尾标记，使用单行格式
ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 签名类型（可选，默认为 RSA2）
ALIPAY_SIGN_TYPE=RSA2

# 支付宝异步通知地址
# 支付完成后，支付宝会向此地址发送异步通知
ALIPAY_NOTIFY_URL=http://localhost:3000/orders/alipay/notify

# 支付宝同步返回地址
# 支付完成后，用户浏览器会跳转到此地址
ALIPAY_RETURN_URL=http://localhost:3000/orders/alipay/return
```

### 2. 获取支付宝配置信息

#### 2.1 注册支付宝开放平台账号

1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 注册并登录账号
3. 完成企业认证（个人开发者也可以使用沙箱环境测试）

#### 2.2 创建应用

1. 进入"控制台" -> "网页&移动应用"
2. 点击"创建应用"
3. 选择应用类型（如：网页应用）
4. 填写应用信息并提交审核

#### 2.3 获取应用信息

创建应用后，在应用详情页面可以获取：

- **APPID**：应用ID，对应 `ALIPAY_APP_ID`
- **应用公钥**：需要上传到支付宝平台
- **支付宝公钥**：在应用详情页面获取，对应 `ALIPAY_PUBLIC_KEY`

#### 2.4 生成密钥对

使用支付宝提供的工具或 OpenSSL 生成 RSA2 密钥对：

```bash
# 使用 OpenSSL 生成私钥
openssl genrsa -out rsa_private_key.pem 2048

# 生成公钥
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem
```

**重要提示**：
- 私钥对应 `ALIPAY_PRIVATE_KEY`，需要去除头尾标记，并将换行符替换为 `\n` 或使用单行格式
- 公钥需要上传到支付宝开放平台

#### 2.5 配置密钥

1. 在应用详情页面，找到"接口加签方式"
2. 上传应用公钥
3. 保存后获取支付宝公钥，填入 `ALIPAY_PUBLIC_KEY`

### 3. 配置回调地址

#### 3.1 异步通知地址（ALIPAY_NOTIFY_URL）

- **开发环境**：`http://localhost:3000/orders/alipay/notify`
- **生产环境**：`https://your-domain.com/orders/alipay/notify`

**注意**：
- 此地址必须是公网可访问的 HTTPS 地址（生产环境）
- 支付宝会向此地址发送 POST 请求，通知支付结果
- 需要在支付宝开放平台配置白名单

#### 3.2 同步返回地址（ALIPAY_RETURN_URL）

- **开发环境**：`http://localhost:3000/orders/alipay/return`
- **生产环境**：`https://your-domain.com/orders/alipay/return`

**注意**：
- 用户支付完成后会跳转到此地址
- 此地址用于前端页面跳转，不能作为支付成功的唯一依据
- 支付成功应以异步通知为准

### 4. 沙箱环境测试

如果使用沙箱环境进行测试：

1. 访问 [支付宝沙箱环境](https://open.alipay.com/develop/sandbox/app)
2. 使用沙箱账号登录
3. 获取沙箱环境的 APPID 和密钥
4. 设置 `ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do`

### 5. 密钥格式说明

#### 私钥格式转换

原始私钥格式：
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

转换为环境变量格式（去除头尾，换行符替换为 `\n`）：
```
ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
```

或者使用单行格式（推荐）：
```
ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...（完整单行）
```

#### 公钥格式转换

同样需要去除头尾标记，使用单行格式。

## 配置验证

配置完成后，启动服务并检查日志：

```bash
npm run start:dev
```

如果配置正确，服务启动时不会报错。如果看到支付宝相关错误，请检查：

1. 环境变量是否正确加载
2. 密钥格式是否正确
3. APPID 是否正确
4. 网关地址是否正确

## 接口说明

### 支付接口

- **GET** `/orders/:id/alipay` - 生成支付宝支付表单

### 回调接口

- **POST** `/orders/alipay/notify` - 支付宝异步通知（由支付宝调用）
- **GET** `/orders/alipay/return` - 支付宝同步返回（用户浏览器跳转）

## 常见问题

### 1. 密钥格式错误

**错误信息**：`Invalid private key format`

**解决方法**：
- 确保私钥已去除 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`
- 确保换行符已替换为 `\n` 或使用单行格式
- 检查私钥是否完整

### 2. 签名验证失败

**错误信息**：`Signature verification failed`

**解决方法**：
- 检查应用公钥是否已正确上传到支付宝平台
- 检查支付宝公钥是否正确配置
- 确认签名类型（RSA2）是否一致

### 3. 回调地址无法访问

**错误信息**：支付宝无法访问回调地址

**解决方法**：
- 确保回调地址是公网可访问的（生产环境需要 HTTPS）
- 检查服务器防火墙设置
- 在支付宝开放平台配置 IP 白名单

### 4. 沙箱环境测试

**提示**：沙箱环境仅用于测试，不能进行真实交易。生产环境需要：
- 完成企业认证
- 应用审核通过
- 使用生产环境网关地址

## 安全建议

1. **保护私钥**：不要将私钥提交到代码仓库，使用环境变量管理
2. **使用 HTTPS**：生产环境必须使用 HTTPS
3. **验证签名**：始终验证支付宝回调的签名
4. **幂等性处理**：异步通知可能重复发送，需要做幂等性处理
5. **日志记录**：记录所有支付相关操作，便于排查问题

## 参考文档

- [支付宝开放平台文档](https://opendocs.alipay.com/)
- [支付宝网页支付文档](https://opendocs.alipay.com/open/270/105899)
- [密钥生成工具](https://opendocs.alipay.com/common/02kkv7)

