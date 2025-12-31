import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Modal,
    Form,
    message,
    Popconfirm,
    Avatar,
    Tooltip,
    Card,
    Row,
    Col,
    Descriptions,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    UserOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ShopUser, UpdateShopUserDto } from '@/types/user';
import {
    getShopUsers,
    getShopUser,
    updateShopUser,
    deleteShopUser,
    checkShopUserDeletable,
    forceDeleteShopUser,
} from '@/services/user';
import './ShopUserManagement.less';

const { Search } = Input;

interface ShopUserManagementProps {
    onUserCountChange?: (count: number) => void;
}

// 定义ref暴露的方法
export interface ShopUserManagementRef {
    refreshData: () => void;
}

const ShopUserManagement = forwardRef<ShopUserManagementRef, ShopUserManagementProps>(({ onUserCountChange }, ref) => {
    // 状态管理
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<ShopUser[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');

    // 模态框状态
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<ShopUser | null>(null);
    const [viewingUser, setViewingUser] = useState<ShopUser | null>(null);
    const [form] = Form.useForm();

    // 初始化数据
    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, searchText]);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        refreshData: () => {
            console.log('🔄 Refreshing shop users data...');
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

            console.log('🔍 Fetching shop users with params:', params);
            const response = await getShopUsers(params);
            console.log('📦 Shop users response:', response);

            // 处理新的API响应结构: { code: 200, data: { data: [], total: 1, page: 1, limit: 1, totalPages: 1 } }
            if (response && response.code === 200 && response.data) {
                const pageData = response.data;
                // 确保数据是数组格式
                const userData = Array.isArray(pageData.data) ? pageData.data : [];
                const totalCount = typeof pageData.total === 'number' && !isNaN(pageData.total) ? pageData.total : 0;

                console.log('✅ Setting shop users:', userData.length, 'users, total:', totalCount);

                // 验证每个用户对象都有必要的字段
                const validUsers = userData.filter(user => user && typeof user === 'object' && user.id);

                setUsers(validUsers);
                setTotal(totalCount);

                // 通知父组件用户数量变化
                if (onUserCountChange) {
                    onUserCountChange(totalCount);
                }
            } else {
                // 如果响应不是预期格式，设置为空数组
                console.warn('⚠️ Invalid shop users response format:', response);
                setUsers([]);
                setTotal(0);
                if (onUserCountChange) {
                    onUserCountChange(0);
                }
            }
        } catch (error) {
            console.error('❌ Failed to fetch shop users:', error);
            message.error('获取用户列表失败');
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

    // 搜索处理
    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1); // 搜索时重置到第一页
    };

    // 查看用户详情
    const handleView = async (user: ShopUser) => {
        try {
            const response = await getShopUser(user.id);
            // 处理新的API响应结构
            const userData = response.code === 200 ? response.data : null;
            if (userData) {
                setViewingUser(userData);
                setIsDetailModalVisible(true);
            } else {
                message.error('获取用户详情失败：响应格式错误');
            }
        } catch (error) {
            message.error('获取用户详情失败');
        }
    };

    // 编辑用户
    const handleEdit = (user: ShopUser) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address,
        });
        setIsEditModalVisible(true);
    };

    // 保存用户
    const handleSave = async (values: any) => {
        if (!editingUser) return;

        try {
            const updateData: UpdateShopUserDto = {
                username: values.username,
                email: values.email,
                phone: values.phone,
                address: values.address,
            };
            await updateShopUser(editingUser.id, updateData);
            message.success('用户更新成功');
            setIsEditModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || '更新失败');
        }
    };

    // 删除用户
    const handleDelete = async (id: number) => {
        try {
            // 首先检查用户是否可以删除
            const checkResponse = await checkShopUserDeletable(id);
            const checkData = checkResponse.code === 200 ? checkResponse.data : null;

            if (!checkData?.canDelete) {
                // 用户有关联数据，显示确认对话框
                const relatedData = checkData?.relatedData || {};
                const relatedItems = [];

                if (relatedData.products > 0) relatedItems.push(`${relatedData.products} 个商品`);
                if (relatedData.comments > 0) relatedItems.push(`${relatedData.comments} 条评论`);
                if (relatedData.carts > 0) relatedItems.push(`${relatedData.carts} 个购物车项`);
                if (relatedData.orders > 0) relatedItems.push(`${relatedData.orders} 个订单`);

                Modal.confirm({
                    title: '用户存在关联数据',
                    content: (
                        <div>
                            <p>该用户存在以下关联数据：</p>
                            <ul>
                                {relatedItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            <p style={{ color: '#ff4d4f', marginTop: 16 }}>
                                <strong>警告：</strong>强制删除将同时删除所有关联数据，此操作不可恢复！
                            </p>
                            <p>您希望如何处理？</p>
                        </div>
                    ),
                    okText: '强制删除（包括关联数据）',
                    okType: 'danger',
                    cancelText: '取消',
                    width: 500,
                    onOk: async () => {
                        try {
                            await forceDeleteShopUser(id, {
                                deleteProducts: true,
                                deleteComments: true,
                                deleteCarts: true,
                                deleteOrders: true,
                            });
                            message.success('用户及关联数据删除成功');
                            fetchUsers();
                        } catch (error: any) {
                            message.error(error.response?.data?.message || '强制删除失败');
                        }
                    },
                });
            } else {
                // 用户没有关联数据，可以直接删除
                await deleteShopUser(id);
                message.success('用户删除成功');
                fetchUsers();
            }
        } catch (error: any) {
            console.error('删除用户失败:', error);
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    // 表格列定义
    const columns: ColumnsType<ShopUser> = [
        {
            title: '头像',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (avatar: string, record: ShopUser) => (
                <Avatar
                    size={40}
                    src={avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#52c41a' }}
                >
                    {!avatar && record.username.charAt(0).toUpperCase()}
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
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 200,
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width: 130,
            render: (text: string) => text || '-',
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
            width: 200,
            render: (text: string) => {
                if (!text) return '-';
                return text.length > 20 ? (
                    <Tooltip title={text}>
                        {text.substring(0, 20)}...
                    </Tooltip>
                ) : text;
            },
        },
        {
            title: '注册时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: '更新时间',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 160,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record: ShopUser) => (
                <Space size="small">
                    <Tooltip title="查看详情">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>

                    <Tooltip title="编辑">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    <Tooltip title="删除">
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="shop-user-management">
            {/* 操作栏 */}
            <Card className="operation-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Search
                            placeholder="搜索用户名、邮箱或手机号"
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: '100%' }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={16} lg={18}>
                        <Space style={{ float: 'right' }}>
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
                    scroll={{ x: 1000 }}
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

            {/* 用户详情模态框 */}
            <Modal
                title="用户详情"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        关闭
                    </Button>,
                ]}
                width={600}
            >
                {viewingUser && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="头像">
                            <Avatar
                                size={64}
                                src={viewingUser.avatar}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#52c41a' }}
                            >
                                {!viewingUser.avatar && viewingUser.username.charAt(0).toUpperCase()}
                            </Avatar>
                        </Descriptions.Item>
                        <Descriptions.Item label="用户ID">{viewingUser.id}</Descriptions.Item>
                        <Descriptions.Item label="用户名">{viewingUser.username}</Descriptions.Item>
                        <Descriptions.Item label="邮箱">{viewingUser.email}</Descriptions.Item>
                        <Descriptions.Item label="手机号">{viewingUser.phone || '未设置'}</Descriptions.Item>
                        <Descriptions.Item label="地址">{viewingUser.address || '未设置'}</Descriptions.Item>
                        <Descriptions.Item label="注册时间">
                            {new Date(viewingUser.created_at).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="更新时间">
                            {new Date(viewingUser.updated_at).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* 编辑用户模态框 */}
            <Modal
                title="编辑用户"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
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

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入正确的邮箱格式' },
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
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
                        name="address"
                        label="地址"
                    >
                        <Input.TextArea
                            placeholder="请输入地址"
                            rows={3}
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsEditModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                更新
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

ShopUserManagement.displayName = 'ShopUserManagement';

export default ShopUserManagement;