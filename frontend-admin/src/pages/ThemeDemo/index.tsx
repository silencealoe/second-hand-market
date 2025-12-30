/**
 * 主题系统演示页面
 */

import React from 'react';
import { Card, Space, Button, Typography, Row, Col, Divider, Tag } from 'antd';
import {
    BulbOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme } from '@/hooks/useTheme';

const { Title, Paragraph, Text } = Typography;

const ThemeDemo: React.FC = () => {
    const { theme, isDark } = useTheme();

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div>
                                <Title level={2}>
                                    <BulbOutlined style={{ marginRight: 8 }} />
                                    主题系统演示
                                </Title>
                                <Paragraph>
                                    这个页面展示了现代化主题系统的功能，包括深色/浅色模式切换、动态主题配置和CSS变量应用。
                                </Paragraph>
                            </div>

                            <Divider />

                            <div>
                                <Title level={3}>主题控制</Title>
                                <Space>
                                    <Text>当前主题模式：</Text>
                                    <Tag color={isDark ? 'blue' : 'orange'}>
                                        {theme.mode === 'light' ? '浅色模式' : theme.mode === 'dark' ? '深色模式' : '跟随系统'}
                                    </Tag>
                                    <ThemeSwitcher type="button" />
                                </Space>
                            </div>

                            <Divider />

                            <div>
                                <Title level={3}>主题配置信息</Title>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} md={8}>
                                        <Card size="small" title="基础配置">
                                            <Space direction="vertical" size="small">
                                                <Text>主色调: <Text code>{theme.primaryColor}</Text></Text>
                                                <Text>圆角: <Text code>{theme.borderRadius}px</Text></Text>
                                                <Text>头部高度: <Text code>{theme.layout.headerHeight}px</Text></Text>
                                                <Text>侧边栏宽度: <Text code>{theme.layout.siderWidth}px</Text></Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Card size="small" title="颜色方案">
                                            <Space direction="vertical" size="small">
                                                <Text>成功色: <Text code>{theme.colorScheme.success}</Text></Text>
                                                <Text>警告色: <Text code>{theme.colorScheme.warning}</Text></Text>
                                                <Text>错误色: <Text code>{theme.colorScheme.error}</Text></Text>
                                                <Text>信息色: <Text code>{theme.colorScheme.info}</Text></Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Card size="small" title="主题状态">
                                            <Space direction="vertical" size="small">
                                                <Text>当前模式: <Text code>{theme.mode}</Text></Text>
                                                <Text>是否深色: <Text code>{isDark ? 'true' : 'false'}</Text></Text>
                                                <Text>自动检测: <Text code>{theme.mode === 'auto' ? 'enabled' : 'disabled'}</Text></Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                            <Divider />

                            <div>
                                <Title level={3}>组件样式演示</Title>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <Card size="small" title="按钮组件">
                                            <Space wrap>
                                                <Button type="primary">主要按钮</Button>
                                                <Button>默认按钮</Button>
                                                <Button type="dashed">虚线按钮</Button>
                                                <Button type="text">文本按钮</Button>
                                                <Button type="link">链接按钮</Button>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Card size="small" title="状态图标">
                                            <Space wrap>
                                                <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag>
                                                <Tag icon={<ExclamationCircleOutlined />} color="warning">警告</Tag>
                                                <Tag icon={<CloseCircleOutlined />} color="error">错误</Tag>
                                                <Tag icon={<InfoCircleOutlined />} color="processing">信息</Tag>
                                            </Space>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                            <Divider />

                            <div>
                                <Title level={3}>CSS变量演示</Title>
                                <div
                                    className="theme-card"
                                    style={{
                                        padding: '16px',
                                        borderRadius: 'var(--border-radius, 6px)',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-color-container)',
                                        color: 'var(--text-color)',
                                        boxShadow: '0 2px 8px var(--shadow-color-light)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <Text>
                                        这个卡片使用CSS变量进行样式设置，会根据主题模式自动调整颜色。
                                        背景色、文字色、边框色和阴影都会随主题变化而变化。
                                    </Text>
                                </div>
                            </div>

                            <Divider />

                            <div>
                                <Title level={3}>功能特性</Title>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Card size="small" title="✨ 已实现功能">
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>深色/浅色主题切换</li>
                                                <li>跟随系统主题设置</li>
                                                <li>动态CSS变量应用</li>
                                                <li>主题配置持久化存储</li>
                                                <li>Ant Design主题集成</li>
                                                <li>响应式设计支持</li>
                                                <li>平滑过渡动画</li>
                                            </ul>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Card size="small" title="🚀 技术特点">
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>TypeScript类型安全</li>
                                                <li>React Hooks集成</li>
                                                <li>UmiJS模型状态管理</li>
                                                <li>CSS-in-JS支持</li>
                                                <li>模块化设计</li>
                                                <li>高性能优化</li>
                                                <li>易于扩展和维护</li>
                                            </ul>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ThemeDemo;