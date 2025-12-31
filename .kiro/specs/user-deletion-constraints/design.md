# 用户删除外键约束处理设计文档

## 架构设计

### 整体架构
```
Frontend (React + Ant Design)
    ↓ HTTP Requests
Backend (NestJS + TypeORM)
    ↓ Database Operations
Database (MySQL) with Foreign Key Constraints
```

### 删除流程架构
```
用户点击删除
    ↓
检查关联数据
    ↓
显示删除选项
    ↓
用户确认操作
    ↓
执行删除操作
    ↓
返回操作结果
```

## 数据库设计

### 外键关系图
```
users (主表)
├── products (user_id → users.id)
├── comments (user_id → users.id)  
├── carts (user_id → users.id)
└── orders (user_id → users.id)
```

### 约束处理策略
```sql
-- 当前外键约束
ALTER TABLE products 
ADD CONSTRAINT FK_products_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- 可选的级联删除（谨慎使用）
ALTER TABLE products 
ADD CONSTRAINT FK_products_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE;
```

## 后端设计

### 服务层架构
```typescript
UsersService
├── remove(id) - 普通删除
├── checkUserDeletable(id) - 检查是否可删除
├── forceRemove(id, options) - 强制删除
└── softDelete(id) - 软删除（可选）
```

### 删除检查逻辑
```typescript
async checkUserDeletable(id: number) {
  // 查询各种关联数据的数量
  const relatedData = {
    products: await this.countUserProducts(id),
    comments: await this.countUserComments(id),
    carts: await this.countUserCarts(id),
    orders: await this.countUserOrders(id),
  };
  
  // 判断是否可以删除
  const canDelete = Object.values(relatedData).every(count => count === 0);
  
  return { canDelete, relatedData };
}
```

### 事务性删除
```typescript
async forceRemove(id: number, options: DeleteOptions) {
  return await this.usersRepository.manager.transaction(async (manager) => {
    // 按依赖顺序删除关联数据
    if (options.deleteCarts) {
      await manager.delete('carts', { user_id: id });
    }
    
    if (options.deleteComments) {
      await manager.delete('comments', { user_id: id });
    }
    
    if (options.deleteProducts) {
      await manager.delete('products', { user_id: id });
    }
    
    if (options.deleteOrders) {
      await manager.delete('orders', { user_id: id });
    }
    
    // 最后删除用户
    await manager.delete('users', { id });
  });
}
```

### 错误处理设计
```typescript
async remove(id: number) {
  try {
    await this.usersRepository.remove(user);
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new ConflictException(
        '无法删除该用户，因为该用户存在关联的商品、订单或其他数据。请先处理相关数据后再删除用户。'
      );
    }
    throw error;
  }
}
```

## 前端设计

### 组件架构
```
ShopUserManagement
├── UserTable
├── DeleteConfirmModal
├── RelatedDataDisplay
└── DeleteProgressModal
```

### 删除确认对话框设计
```typescript
const DeleteConfirmModal = ({ user, relatedData, onConfirm, onCancel }) => {
  return (
    <Modal
      title="用户删除确认"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="force" type="danger" onClick={handleForceDelete}>
          强制删除（包括关联数据）
        </Button>
      ]}
    >
      <div>
        <p>该用户存在以下关联数据：</p>
        <RelatedDataDisplay data={relatedData} />
        <Alert
          message="警告"
          description="强制删除将同时删除所有关联数据，此操作不可恢复！"
          type="warning"
          showIcon
        />
      </div>
    </Modal>
  );
};
```

### 关联数据可视化
```typescript
const RelatedDataDisplay = ({ data }) => {
  const items = [
    { label: '商品', count: data.products, icon: <ShopOutlined /> },
    { label: '评论', count: data.comments, icon: <CommentOutlined /> },
    { label: '购物车', count: data.carts, icon: <ShoppingCartOutlined /> },
    { label: '订单', count: data.orders, icon: <FileTextOutlined /> },
  ];

  return (
    <div className="related-data-display">
      {items.map(item => (
        <div key={item.label} className="data-item">
          {item.icon}
          <span>{item.label}: {item.count}</span>
        </div>
      ))}
    </div>
  );
};
```

### 删除流程状态管理
```typescript
const useUserDeletion = () => {
  const [deleteState, setDeleteState] = useState({
    checking: false,
    deleting: false,
    showConfirm: false,
    relatedData: null,
  });

  const handleDelete = async (userId: number) => {
    setDeleteState(prev => ({ ...prev, checking: true }));
    
    try {
      // 检查关联数据
      const checkResult = await checkShopUserDeletable(userId);
      
      if (checkResult.data.canDelete) {
        // 直接删除
        await deleteShopUser(userId);
        message.success('用户删除成功');
      } else {
        // 显示确认对话框
        setDeleteState(prev => ({
          ...prev,
          showConfirm: true,
          relatedData: checkResult.data.relatedData,
        }));
      }
    } catch (error) {
      message.error('删除失败');
    } finally {
      setDeleteState(prev => ({ ...prev, checking: false }));
    }
  };

  return { deleteState, handleDelete };
};
```

## API设计

### 检查删除接口
```typescript
GET /users/:id/check-deletable

Response:
{
  "code": 200,
  "data": {
    "canDelete": false,
    "relatedData": {
      "products": 5,
      "comments": 12,
      "carts": 3,
      "orders": 8
    }
  }
}
```

### 删除用户接口
```typescript
DELETE /users/:id?force=true&deleteProducts=true&deleteComments=true

Response:
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 错误响应
```typescript
{
  "statusCode": 409,
  "message": "无法删除该用户，因为该用户存在关联的商品、订单或其他数据。请先处理相关数据后再删除用户。",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/users/7"
}
```

## 安全设计

### 权限控制
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super-admin') // 只有超级管理员可以强制删除
async forceRemove(@Param('id') id: number) {
  // 强制删除逻辑
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin') // 管理员可以普通删除
async remove(@Param('id') id: number) {
  // 普通删除逻辑
}
```

### 操作日志
```typescript
@Injectable()
export class UserDeletionLogger {
  async logDeletion(userId: number, operatorId: number, options: {
    type: 'normal' | 'force';
    deletedData?: string[];
    success: boolean;
    error?: string;
  }) {
    await this.operationLogRepository.save({
      adminUserId: operatorId,
      module: '用户管理',
      action: options.type === 'force' ? '强制删除用户' : '删除用户',
      targetId: userId,
      description: `删除用户ID: ${userId}, 删除类型: ${options.type}, 删除数据: ${options.deletedData?.join(', ') || '无'}`,
      success: options.success,
      error: options.error,
      ipAddress: this.getClientIp(),
      userAgent: this.getUserAgent(),
    });
  }
}
```

## 性能优化设计

### 查询优化
```typescript
// 使用单个查询获取所有关联数据统计
async getRelatedDataCounts(userId: number) {
  const result = await this.usersRepository
    .createQueryBuilder('user')
    .leftJoin('user.products', 'product')
    .leftJoin('user.comments', 'comment')
    .leftJoin('user.carts', 'cart')
    .leftJoin('user.orders', 'order')
    .select([
      'COUNT(DISTINCT product.id) as products',
      'COUNT(DISTINCT comment.id) as comments',
      'COUNT(DISTINCT cart.id) as carts',
      'COUNT(DISTINCT order.id) as orders'
    ])
    .where('user.id = :userId', { userId })
    .getRawOne();
    
  return {
    products: parseInt(result.products) || 0,
    comments: parseInt(result.comments) || 0,
    carts: parseInt(result.carts) || 0,
    orders: parseInt(result.orders) || 0,
  };
}
```

### 批量删除优化
```typescript
async batchDelete(userIds: number[], options: DeleteOptions) {
  return await this.usersRepository.manager.transaction(async (manager) => {
    // 批量删除关联数据
    if (options.deleteProducts) {
      await manager
        .createQueryBuilder()
        .delete()
        .from('products')
        .where('user_id IN (:...userIds)', { userIds })
        .execute();
    }
    
    // 批量删除用户
    await manager
      .createQueryBuilder()
      .delete()
      .from('users')
      .where('id IN (:...userIds)', { userIds })
      .execute();
  });
}
```

## 错误处理设计

### 错误分类
```typescript
enum DeletionErrorType {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  HAS_RELATED_DATA = 'HAS_RELATED_DATA',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}
```

### 错误处理策略
```typescript
class UserDeletionError extends Error {
  constructor(
    public type: DeletionErrorType,
    public message: string,
    public relatedData?: any
  ) {
    super(message);
  }
}

// 使用示例
try {
  await this.usersService.remove(id);
} catch (error) {
  if (error instanceof UserDeletionError) {
    switch (error.type) {
      case DeletionErrorType.HAS_RELATED_DATA:
        return this.handleRelatedDataError(error);
      case DeletionErrorType.PERMISSION_DENIED:
        return this.handlePermissionError(error);
      default:
        return this.handleGenericError(error);
    }
  }
  throw error;
}
```

## 测试设计

### 单元测试
```typescript
describe('UsersService', () => {
  describe('remove', () => {
    it('should delete user without related data', async () => {
      const user = createMockUser();
      jest.spyOn(service, 'checkUserDeletable').mockResolvedValue({
        canDelete: true,
        relatedData: { products: 0, comments: 0, carts: 0, orders: 0 }
      });
      
      await expect(service.remove(user.id)).resolves.not.toThrow();
    });

    it('should throw ConflictException for user with related data', async () => {
      const user = createMockUserWithProducts();
      
      await expect(service.remove(user.id))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('forceRemove', () => {
    it('should delete user and related data in transaction', async () => {
      const user = createMockUserWithProducts();
      const mockTransaction = jest.fn();
      
      await service.forceRemove(user.id, { deleteProducts: true });
      
      expect(mockTransaction).toHaveBeenCalled();
    });
  });
});
```

### 集成测试
```typescript
describe('User Deletion API', () => {
  it('should handle deletion with foreign key constraints', async () => {
    // 创建用户和关联数据
    const user = await createTestUser();
    const product = await createTestProduct(user.id);
    
    // 尝试删除用户
    const response = await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .expect(409);
      
    expect(response.body.message).toContain('关联数据');
  });

  it('should force delete user with related data', async () => {
    const user = await createTestUser();
    const product = await createTestProduct(user.id);
    
    await request(app.getHttpServer())
      .delete(`/users/${user.id}?force=true&deleteProducts=true`)
      .expect(200);
      
    // 验证用户和产品都被删除
    await expect(findUser(user.id)).rejects.toThrow();
    await expect(findProduct(product.id)).rejects.toThrow();
  });
});
```

## 监控和日志设计

### 操作监控
```typescript
@Injectable()
export class UserDeletionMonitor {
  private readonly logger = new Logger(UserDeletionMonitor.name);

  async monitorDeletion(operation: DeletionOperation) {
    const startTime = Date.now();
    
    try {
      const result = await operation.execute();
      const duration = Date.now() - startTime;
      
      this.logger.log(`User deletion completed: ${JSON.stringify({
        userId: operation.userId,
        type: operation.type,
        duration,
        success: true
      })}`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`User deletion failed: ${JSON.stringify({
        userId: operation.userId,
        type: operation.type,
        duration,
        error: error.message,
        success: false
      })}`);
      
      throw error;
    }
  }
}
```

### 性能指标
```typescript
interface DeletionMetrics {
  totalDeletions: number;
  successfulDeletions: number;
  failedDeletions: number;
  averageResponseTime: number;
  foreignKeyErrors: number;
  forceDeletions: number;
}
```

## 部署考虑

### 数据库迁移
```sql
-- 添加软删除支持（可选）
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE users ADD INDEX idx_deleted_at (deleted_at);

-- 添加删除日志表
CREATE TABLE user_deletion_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  operator_id INT NOT NULL,
  deletion_type ENUM('normal', 'force') NOT NULL,
  deleted_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 配置管理
```typescript
// 删除策略配置
export const deletionConfig = {
  // 是否启用软删除
  enableSoftDelete: process.env.ENABLE_SOFT_DELETE === 'true',
  
  // 强制删除权限角色
  forceDeleteRoles: ['super-admin'],
  
  // 删除操作超时时间（毫秒）
  deletionTimeout: parseInt(process.env.DELETION_TIMEOUT) || 30000,
  
  // 是否记录详细日志
  enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true',
};
```