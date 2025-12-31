import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Badge, Breadcrumb } from 'antd';
import type { TabsProps } from 'antd';
import { UserOutlined, TeamOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { AdminUserManagement, ShopUserManagement, AdminUserManagementRef, ShopUserManagementRef } from './components';
import { getAdminUsers, getShopUsers } from '@/services/user';
import './index.less';

const UserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('admin');
    const [adminUserCount, setAdminUserCount] = useState<number>(0);
    const [shopUserCount, setShopUserCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // 使用ref来访问子组件的方法
    const adminUserRef = useRef<AdminUserManagementRef>(null);
    const shopUserRef = useRef<ShopUserManagementRef>(null);

    // 获取用户数量统计
    useEffect(() => {
        fetchUserCounts();
    }, []);

    const fetchUserCounts = async () => {
        setLoading(true);
        try {
            // 获取管理员用户数量
            const adminResponse = await getAdminUsers({ page: 1, limit: 1 });
            let adminCount = 0;
            if (adminResponse && adminResponse.code === 200 && adminResponse.data && typeof adminResponse.data.total === 'number') {
                adminCount = adminResponse.data.total;
            }
            setAdminUserCount(adminCount);

            // 获取商城用户数量
            const shopResponse = await getShopUsers({ page: 1, limit: 1 });
            let shopCount = 0;
            if (shopResponse && shopResponse.code === 200 && shopResponse.data && typeof shopResponse.data.total === 'number') {
                shopCount = shopResponse.data.total;
            }
            setShopUserCount(shopCount);
        } catch (error) {
            console.error('获取用户数量失败:', error);
            // 确保在错误情况下也设置为0
            setAdminUserCount(0);
            setShopUserCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key: string) => {
        console.log('🔄 Tab changed to:', key);
        setActiveTab(key);

        // 切换tab时刷新对应的数据
        if (key === 'admin' && adminUserRef.current) {
            adminUserRef.current.refreshData();
        } else if (key === 'shop' && shopUserRef.current) {
            shopUserRef.current.refreshData();
        }
    };

    // 处理子组件用户数量变化的回调
    const handleAdminUserCountChange = (count: number) => {
        const validCount = typeof count === 'number' && !isNaN(count) ? count : 0;
        setAdminUserCount(validCount);
    };

    const handleShopUserCountChange = (count: number) => {
        const validCount = typeof count === 'number' && !isNaN(count) ? count : 0;
        setShopUserCount(validCount);
    };

    // 使用新的 items API，并添加徽章显示用户数量
    const tabItems: TabsProps['items'] = [
        {
            key: 'admin',
            label: (
                <span>
                    <TeamOutlined />
                    后台管理用户
                    <Badge
                        count={adminUserCount || 0}
                        style={{
                            marginLeft: 8,
                            backgroundColor: '#52c41a'
                        }}
                        showZero
                    />
                </span>
            ),
            children: <AdminUserManagement ref={adminUserRef} onUserCountChange={handleAdminUserCountChange} />,
        },
        {
            key: 'shop',
            label: (
                <span>
                    <UserOutlined />
                    商城用户
                    <Badge
                        count={shopUserCount || 0}
                        style={{
                            marginLeft: 8,
                            backgroundColor: '#1890ff'
                        }}
                        showZero
                    />
                </span>
            ),
            children: <ShopUserManagement ref={shopUserRef} onUserCountChange={handleShopUserCountChange} />,
        },
    ];

    return (
        <div className="user-management-container">
            <div className="page-header">
                <Breadcrumb
                    items={[
                        {
                            href: '/dashboard',
                            title: (
                                <>
                                    <HomeOutlined />
                                    <span>首页</span>
                                </>
                            ),
                        },
                        {
                            title: (
                                <>
                                    <SettingOutlined />
                                    <span>系统管理</span>
                                </>
                            ),
                        },
                        {
                            title: (
                                <>
                                    <UserOutlined />
                                    <span>用户管理</span>
                                </>
                            ),
                        },
                    ]}
                />

                <div className="page-title">
                    <h2>用户管理</h2>
                    <p>管理后台管理员和商城用户信息</p>
                </div>

                <div className="stats-summary">
                    <span className="stat-item">
                        管理员用户：<strong>{loading ? '加载中...' : (adminUserCount || 0)}</strong> 人
                    </span>
                    <span className="stat-item">
                        商城用户：<strong>{loading ? '加载中...' : (shopUserCount || 0)}</strong> 人
                    </span>
                    <span className="stat-item">
                        总计：<strong>{loading ? '加载中...' : ((adminUserCount || 0) + (shopUserCount || 0))}</strong> 人
                    </span>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                className="user-management-tabs"
                size="large"
                items={tabItems}
                type="line"
                tabPosition="top"
                animated={{
                    inkBar: true,
                    tabPane: true,
                }}
            />
        </div>
    );
};

export default UserManagement;