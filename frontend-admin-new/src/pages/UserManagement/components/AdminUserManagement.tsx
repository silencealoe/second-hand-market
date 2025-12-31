import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Select,
    Modal,
    Form,
    message,
    Popconfirm,
    Tag,
    Avatar,
    Tooltip,
    Card,
    Row,
    Col,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    KeyOutlined,
    UserOutlined,
    StopOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AdminUser, AdminRole, CreateAdminUserDto, UpdateAdminUserDto, UserStatus, RoleType } from '@/types/user';
import {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    resetAdminUserPassword,
    toggleAdminUserStatus,
    getAdminRoles,
} from '@/services/user';
import './AdminUserManagement.less';

const { Option } = Select;
const { Search } = Input;

interface AdminUserManagementProps {
    onUserCountChange?: (count: number) => void;
}

// 定义ref暴露的方法
export interface AdminUserManagementRef {
    refreshData: () => void;
}

const AdminUserManagement = forwardRef<AdminUserManagementRef, AdminUserManagementProps>(({ onUserCountChange }, ref) => {
    // 状态管理
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<number | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<number | undefined>();

    // 模态框状态
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [form] = Form.useForm();

    // 初始化数据
    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [currentPage, pageSize, searchText, selectedRole, selectedStatus]);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        refreshData: () => {
            console.log('🔄 Refreshing admin users data...');
            fetchUsers();
        }
    }));

    // 获取用户列表
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

            // 只有当选择了角色时才添加roleId参数
            if (selectedRole !== undefined && selectedRole !== null) {
                params.roleId = selectedRole;
            }

            // 只有当选择了状态时才添加status参数
            if (selectedStatus !== undefined && selectedStatus !== null) {
                params.status = selectedStatus;
            }

            const response = await getAdminUsers(params);
            console.log('📦 Admin users response:', response);

            // 处理新的API响应结构: { code: 200, data: { data: [], total: 1, page: 1, limit: 1, totalPages: 1 } }
            if (response && response.code === 200 && response.data) {
                const pageData = response.data;
                // 确保数据是数组格式
                const userData = Array.isArray(pageData.data) ? pageData.data : [];
                const totalCount = typeof pageData.total === 'number' && !isNaN(pageData.total) ? pageData.total : 0;

                console.log('✅ Setting admin users:', { userData: userData.length, totalCount });

                // 验证每个用户对象都有必要的字段
                const validUsers = userData.filter(user => user && typeof user === 'object' && user.id);

                setUsers(validUsers);
                setTotal(totalCount);

                // 通知父组件用户数量变化
                if (onUserCountChange) {
                    onUserCountChange(totalCount);
                }
            } else {
                // 如果响应格式不正确，设置为空数组
                console.warn('⚠️ Invalid admin users response format:', response);
                setUsers([]);
                setTotal(0);
                if (onUserCountChange) {
                    onUserCountChange(0);
                }
            }
        } catch (error) {
            message.error('获取用户列表失败');
            console.error('❌ Admin users fetch error:', error);
            // 错误时设置为空数组，防止Table组件报错
            setUsers([]);
            setTotal(0);
            if (onUserCountChange) {
                onUserCountChange(0);
            }
        } finally {
            setLoading(false);
        }
    };

    // 获取角色列表
    const fetchRoles = async () => {
        try {
            const response = await getAdminRoles();
            console.log('📦 Admin roles response:', response);

            // 处理新的API响应结构
            if (response && response.code === 200 && Array.isArray(response.data)) {
                setRoles(response.data);
            } else {
                // 如果响应不是预期格式，使用默认角色
                console.warn('⚠️ Invalid roles response, using default roles');
                setRoles([
                    { id: 1, name: '超级管理员', description: '拥有所有权限', isSuper: 1, status: 1, createdAt: '', updatedAt: '' },
                    { id: 2, name: '普通管理员', description: '基础管理权限', isSuper: 0, status: 1, createdAt: '', updatedAt: '' },
                ]);
            }
        } catch (error) {
            console.error('获取角色列表失败:', error);
            // 如果角色接口不存在，使用默认角色
            setRoles([
                { id: 1, name: '超级管理员', description: '拥有所有权限', isSuper: 1, status: 1, createdAt: '', updatedAt: '' },
                { id: 2, name: '普通管理员', description: '基础管理权限', isSuper: 0, status: 1, createdAt: '', updatedAt: '' },
            ]);
        }
    };

    // 搜索处理
    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    // 筛选处理
    const handleRoleFilter = (value: number | undefined) => {
        setSelectedRole(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value: number | undefined) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    };

    // 新增用户
    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 编辑用户
    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            realName: user.realName,
            phone: user.phone,
            roleId: user.roleId,
            status: user.status,
        });
        setIsModalVisible(true);
    };

    // 保存用户
    const handleSave = async (values: any) => {
        try {
            if (editingUser) {
                // 更新用户
                const updateData: UpdateAdminUserDto = {
                    username: values.username,
                    realName: values.realName,
                    phone: values.phone,
                    roleId: values.roleId,
                    status: values.status,
                };
                await updateAdminUser(editingUser.id, updateData);
                message.success('用户更新成功');
            } else {
                // 创建用户
                const createData: CreateAdminUserDto = {
                    username: values.username,
                    password: values.password,
                    realName: values.realName,
                    phone: values.phone,
                    roleId: values.roleId,
                    status: values.status ?? 1,
                };
                await createAdminUser(createData);
                message.success('用户创建成功');
            }
            setIsModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        }
    };

    // 删除用户
    const handleDelete = async (id: number) => {
        try {
            await deleteAdminUser(id);
            message.success('用户删除成功');
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    // 重置密码
    const handleResetPassword = async (id: number) => {
        try {
            const response = await resetAdminUserPassword(id);
            // 处理新的API响应结构
            const data = response.code === 200 ? response.data : null;
            if (data && data.newPassword) {
                Modal.info({
                    title: '密码重置成功',
                    content: (
                        <div>
                            <p>新密码：<strong>{data.newPassword}</strong></p>
                            <p style={{ color: '#ff4d4f' }}>请妥善保管新密码，并提醒用户及时修改！</p>
                        </div>
                    ),
                });
            } else {
                message.error('密码重置失败：响应格式错误');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '重置密码失败');
        }
    };

    // 切换用户状态
    const handleToggleStatus = async (id: number, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            await toggleAdminUserStatus(id, newStatus);
            message.success(`用户${newStatus === 1 ? '启用' : '禁用'}成功`);
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        }
    };

    // 表格列定义
    const columns: ColumnsType<AdminUser> = [
        {
            title: '头像',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (avatar: string, record: AdminUser) => (
                <Avatar
                    size={40}
                    src={avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                >
                    {!avatar && record.realName ? record.realName.charAt(0) : record.username.charAt(0)}
                </Avatar>
            ),
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: 120,
        },
        {
            title: '真实姓名',
            dataIndex: 'realName',
            key: 'realName',
            width: 120,
            render: (text: string) => text || '-',
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width: 130,
            render: (text: string) => text || '-',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (role: AdminRole) => {
                if (!role) return '-';
                return (
                    <Tag color={role.isSuper === RoleType.SUPER ? 'red' : 'blue'}>
                        {role.name}
                    </Tag>
                );
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: number) => (
                <Tag color={status === UserStatus.ENABLED ? 'success' : 'error'}>
                    {status === UserStatus.ENABLED ? '启用' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '最后登录',
            dataIndex: 'lastLoginAt',
            key: 'lastLoginAt',
            width: 160,
            render: (text: string) => text ? new Date(text).toLocaleString() : '从未登录',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record: AdminUser) => (
                <Space size="small">
                    <Tooltip title="编辑">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    <Tooltip title="重置密码">
                        <Popconfirm
                            title="确定要重置该用户的密码吗？"
                            onConfirm={() => handleResetPassword(record.id)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button
                                size="small"
                                icon={<KeyOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip title={record.status === UserStatus.ENABLED ? '禁用' : '启用'}>
                        <Popconfirm
                            title={`确定要${record.status === UserStatus.ENABLED ? '禁用' : '启用'}该用户吗？`}
                            onConfirm={() => handleToggleStatus(record.id, record.status)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button
                                size="small"
                                icon={record.status === UserStatus.ENABLED ? <StopOutlined /> : <CheckCircleOutlined />}
                                danger={record.status === UserStatus.ENABLED}
                            />
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip title="删除">
                        <Popconfirm
                            title="确定要删除该用户吗？此操作不可恢复！"
                            onConfirm={() => handleDelete(record.id)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-user-management">
            {/* 操作栏 */}
            <Card className="operation-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Search
                            placeholder="搜索用户名或姓名"
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: '100%' }}
                        />
                    </Col>

                    <Col xs={12} sm={6} md={4} lg={3}>
                        <Select
                            placeholder="选择角色"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={handleRoleFilter}
                        >
                            {roles.map(role => (
                                <Option key={role.id} value={role.id}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={12} sm={6} md={4} lg={3}>
                        <Select
                            placeholder="选择状态"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={handleStatusFilter}
                        >
                            <Option value={UserStatus.ENABLED}>启用</Option>
                            <Option value={UserStatus.DISABLED}>禁用</Option>
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={12}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                新增用户
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchUsers}
                            >
                                刷新
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* 用户表格 */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={users || []}
                    rowKey={(record) => record?.id || Math.random()}
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total || 0,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `第 ${range?.[0] || 0}-${range?.[1] || 0} 条/共 ${total || 0} 条`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size || 10);
                        },
                    }}
                />
            </Card>

            {/* 新增/编辑用户模态框 */}
            <Modal
                title={editingUser ? '编辑用户' : '新增用户'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, max: 20, message: '用户名长度为3-20个字符' },
                        ]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[
                                { required: true, message: '请输入密码' },
                                { min: 6, message: '密码至少6个字符' },
                            ]}
                        >
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="realName"
                        label="真实姓名"
                    >
                        <Input placeholder="请输入真实姓名" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                        ]}
                    >
                        <Input placeholder="请输入手机号" />
                    </Form.Item>

                    <Form.Item
                        name="roleId"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            {roles.map(role => (
                                <Option key={role.id} value={role.id}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                        initialValue={1}
                    >
                        <Select>
                            <Option value={UserStatus.ENABLED}>启用</Option>
                            <Option value={UserStatus.DISABLED}>禁用</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? '更新' : '创建'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

AdminUserManagement.displayName = 'AdminUserManagement';

export default AdminUserManagement;