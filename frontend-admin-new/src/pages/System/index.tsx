import React from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import './index.less';

const System: React.FC = () => {
    return (
        <div className="system-page">
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
                    ]}
                />
            </div>

            <div className="page-content">
                <Outlet />
            </div>
        </div>
    );
};

export default System;