import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { PageContainer } from '@ant-design/pro-components';

const { Title, Paragraph } = Typography;

const LayoutTestPage: React.FC = () => {
    return (
        <PageContainer
            title="布局系统测试页面"
            subTitle="测试增强的ProLayout组件功能"
        >
            <Card title="布局功能测试" style={{ marginBottom: 16 }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={4}>✅ 响应式侧边栏</Title>
                        <Paragraph>
                            侧边栏应该在桌面端显示为固定侧边栏，在移动端显示为抽屉菜单。
                            尝试调整浏览器窗口大小来测试响应式功能。
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>✅ 动态面包屑导航</Title>
                        <Paragraph>
                            页面顶部应该显示面包屑导航，显示当前页面路径。
                            面包屑应该可以点击跳转到对应页面。
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>✅ 增强的头部组件</Title>
                        <Paragraph>
                            头部应该包含折叠按钮、面包屑导航、主题切换器和用户信息。
                            用户信息区域应该显示头像和用户名，点击可以显示下拉菜单。
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>✅ 导航菜单</Title>
                        <Paragraph>
                            左侧菜单应该显示系统的主要功能模块，包括数据仪表板、用户管理、商品管理等。
                            菜单项应该可以点击跳转，当前页面对应的菜单项应该高亮显示。
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>测试操作</Title>
                        <Space>
                            <Button type="primary" onClick={() => window.location.href = '/home'}>
                                跳转到首页
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                刷新页面
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Card>

            <Card title="布局状态信息">
                <Paragraph>
                    <strong>当前路径:</strong> {window.location.pathname}
                </Paragraph>
                <Paragraph>
                    <strong>屏幕宽度:</strong> {window.innerWidth}px
                </Paragraph>
                <Paragraph>
                    <strong>屏幕高度:</strong> {window.innerHeight}px
                </Paragraph>
                <Paragraph>
                    <strong>是否移动端:</strong> {window.innerWidth < 768 ? '是' : '否'}
                </Paragraph>
            </Card>
        </PageContainer>
    );
};

export default LayoutTestPage;