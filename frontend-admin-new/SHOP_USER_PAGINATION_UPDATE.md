# 商城用户列表分页功能实现

## 概述

为商城用户列表添加了分页功能，使其与后台管理用户的数据结构保持一致。实现了服务端分页、搜索功能，并统一了前后端的API响应格式。

## 后端更改

### 1. 用户控制器更新 (`backend/src/users/users.controller.ts`)

#### 添加查询参数支持
```typescript
@Get()
@ApiOperation({ summary: '获取商城用户列表' })
@ApiQuery({ name: 'page', required: false, description: '页码，默认1' })
@ApiQuery({ name: 'limit', required: false, description: '每页数量，默认10' })
@ApiQuery({ name: 'search', required: false, description: '搜索关键词（用户名、邮箱）' })
@ApiResponse({ status: 200, description: '获取成功', type: [User] })
async findAll(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
) {
  // 安全地转换参数，避免NaN
  const pageNum = parseInt(page || '1', 10) || 1;
  const limitNum = parseInt(limit || '10', 10) || 10;

  const result = await this.usersService.findAll({
    page: pageNum,
    limit: limitNum,
    search: search?.trim(),
  });
  
  return {
    code: 200,
    message: 'success',
    data: result
  };
}
```

#### 主要改进
- ✅ 添加了分页参数支持 (`page`, `limit`)
- ✅ 添加了搜索功能 (`search`)
- ✅ 参数安全转换，避免NaN错误
- ✅ 统一的API响应格式

### 2. 用户服务更新 (`backend/src/users/users.service.ts`)

#### 实现分页查询
```typescript
async findAll(options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { page = 1, limit = 10, search } = options || {};
  const skip = (page - 1) * limit;

  const queryBuilder = this.usersRepository
    .createQueryBuilder('user')
    .select(['user.id', 'user.username', 'user.email', 'user.phone', 'user.avatar', 'user.address', 'user.created_at', 'user.updated_at']);

  // 关键词搜索（用户名或邮箱）
  if (search) {
    queryBuilder.andWhere(
      '(user.username LIKE :search OR user.email LIKE :search)',
      { search: `%${search}%` }
    );
  }

  // 排序和分页
  queryBuilder
    .orderBy('user.id', 'DESC')
    .skip(skip)
    .take(limit);

  const [users, total] = await queryBuilder.getManyAndCount();

  return {
    data: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

#### 主要特性
- ✅ 使用QueryBuilder实现高效分页
- ✅ 支持用户名和邮箱的模糊搜索
- ✅ 按ID降序排列（最新用户在前）
- ✅ 返回完整的分页信息
- ✅ 与管理员用户API保持一致的响应格式

## 前端更改

### 1. 用户服务更新 (`frontend-admin-new/src/services/user.ts`)

#### 添加分页参数支持
```typescript
// 获取商城用户列表
export const getShopUsers = async (params?: UserPageQuery): Promise<ApiResponse<PageResponse<ShopUser>>> => {
    return apiRequest.get('/users', { params });
};
```

- ✅ 支持可选的分页参数
- ✅ 使用统一的`UserPageQuery`类型
- ✅ 返回统一的`ApiResponse<PageResponse<ShopUser>>`格式

### 2. ShopUserManagement组件更新

#### 状态管理改进
```typescript
const [users, setUsers] = useState<ShopUser[]>([]);
const [total, setTotal] = useState(0);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [searchText, setSearchText] = useState('');
```

- ✅ 移除了`filteredUsers`状态（现在由服务端处理）
- ✅ 添加了分页相关状态管理
- ✅ 与AdminUserManagement保持一致

#### 数据获取逻辑
```typescript
const fetchUsers = async () => {
  setLoading(true);
  try {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    // 只有当搜索文本不为空时才添加search参数
    if (searchText && searchText.trim()) {
      params.search = searchText.trim();
    }

    const response = await getShopUsers(params);
    
    // 处理API响应结构
    if (response && response.code === 200 && response.data) {
      const pageData = response.data;
      const userData = Array.isArray(pageData.data) ? pageData.data : [];
      const totalCount = typeof pageData.total === 'number' ? pageData.total : 0;
      
      setUsers(userData);
      setTotal(totalCount);
      
      if (onUserCountChange) {
        onUserCountChange(totalCount);
      }
    }
  } catch (error) {
    // 错误处理...
  } finally {
    setLoading(false);
  }
};
```

#### 分页组件配置
```typescript
<Table
  columns={columns}
  dataSource={Array.isArray(users) ? users : []}
  rowKey="id"
  loading={loading}
  scroll={{ x: 1000 }}
  pagination={{
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size || 10);
    },
  }}
/>
```

#### 搜索功能优化
```typescript
const handleSearch = (value: string) => {
  setSearchText(value);
  setCurrentPage(1); // 搜索时重置到第一页
};
```

### 3. 主组件用户数量统计更新

```typescript
// 获取商城用户数量
const shopResponse = await getShopUsers({ page: 1, limit: 1 });
let shopCount = 0;
if (shopResponse && shopResponse.code === 200 && shopResponse.data && typeof shopResponse.data.total === 'number') {
  shopCount = shopResponse.data.total;
}
setShopUserCount(shopCount);
```

- ✅ 使用分页API获取总数
- ✅ 只请求第一页的1条数据来获取总数
- ✅ 提高性能，减少数据传输

## 功能特性

### 1. 分页功能
- ✅ 服务端分页，提高性能
- ✅ 可配置每页显示数量
- ✅ 快速跳转到指定页面
- ✅ 显示分页统计信息

### 2. 搜索功能
- ✅ 支持用户名搜索
- ✅ 支持邮箱搜索
- ✅ 实时搜索（输入后自动搜索）
- ✅ 搜索时自动重置到第一页

### 3. 数据一致性
- ✅ 与管理员用户API保持相同的响应格式
- ✅ 统一的错误处理机制
- ✅ 一致的加载状态管理
- ✅ 相同的用户体验

### 4. 性能优化
- ✅ 服务端分页减少数据传输
- ✅ 按需加载数据
- ✅ 优化的数据库查询
- ✅ 减少前端内存占用

## API接口规范

### 请求参数
```
GET /api/users?page=1&limit=10&search=keyword
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 10 | 每页数量 |
| search | string | 否 | - | 搜索关键词 |

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 测试建议

### 1. 分页测试
- 验证不同页码的数据加载
- 测试每页数量变更
- 验证总页数计算正确性

### 2. 搜索测试
- 测试用户名搜索功能
- 测试邮箱搜索功能
- 验证搜索结果的准确性
- 测试空搜索结果的处理

### 3. 性能测试
- 大数据量下的分页性能
- 搜索响应时间
- 内存使用情况

### 4. 兼容性测试
- 与管理员用户功能的一致性
- 不同浏览器的兼容性
- 移动端响应式布局

## 文件变更清单

### 后端文件
- `backend/src/users/users.controller.ts` - 添加分页和搜索参数
- `backend/src/users/users.service.ts` - 实现分页查询逻辑

### 前端文件
- `frontend-admin-new/src/services/user.ts` - 更新API调用
- `frontend-admin-new/src/pages/UserManagement/components/ShopUserManagement.tsx` - 实现分页组件
- `frontend-admin-new/src/pages/UserManagement/index.tsx` - 更新用户数量统计

## 向后兼容性

- ✅ 所有参数都是可选的，保持向后兼容
- ✅ 默认值确保现有调用不会出错
- ✅ 响应格式扩展，不破坏现有功能