/**
 * 测试 API 响应数据结构
 * 这个文件用于验证接口返回数据的结构是否正确
 */

import { login, getUserInfo } from '@/services/auth';
import { getCoreMetrics } from '@/services/dashboard';

// 测试登录接口响应结构
export const testLoginResponse = async () => {
    try {
        console.log('🧪 测试登录接口响应结构...');

        // 注意：这里需要提供真实的测试账号
        const mockLoginData = {
            username: 'test',
            password: 'test123'
        };

        const response = await login(mockLoginData);
        console.log('📦 登录接口原始响应:', response);

        // 检查响应结构
        if (response && response.data) {
            console.log('✅ 响应包含 data 属性');
            console.log('📊 data 内容:', response.data);

            if (response.data.token) {
                console.log('✅ data 中包含 token');
            } else {
                console.log('❌ data 中缺少 token');
            }

            if (response.data.user) {
                console.log('✅ data 中包含 user');
            } else {
                console.log('❌ data 中缺少 user');
            }
        } else {
            console.log('❌ 响应缺少 data 属性');
        }

        return response;
    } catch (error) {
        console.error('❌ 登录接口测试失败:', error);
        return null;
    }
};

// 测试其他接口响应结构
export const testDashboardResponse = async () => {
    try {
        console.log('🧪 测试仪表板接口响应结构...');

        const response = await getCoreMetrics({ period: 'day' });
        console.log('📦 仪表板接口原始响应:', response);

        // 检查响应结构
        if (response && response.data) {
            console.log('✅ 响应包含 data 属性');
            console.log('📊 data 内容:', response.data);
        } else {
            console.log('❌ 响应缺少 data 属性');
        }

        return response;
    } catch (error) {
        console.error('❌ 仪表板接口测试失败:', error);
        return null;
    }
};

// 测试用户信息接口响应结构
export const testUserInfoResponse = async () => {
    try {
        console.log('🧪 测试用户信息接口响应结构...');

        const response = await getUserInfo();
        console.log('📦 用户信息接口原始响应:', response);

        // 检查响应结构
        if (response && response.data) {
            console.log('✅ 响应包含 data 属性');
            console.log('📊 data 内容:', response.data);
        } else {
            console.log('❌ 响应缺少 data 属性');
        }

        return response;
    } catch (error) {
        console.error('❌ 用户信息接口测试失败:', error);
        return null;
    }
};

// 综合测试函数
export const testAllApiResponses = async () => {
    console.log('🚀 开始测试所有 API 响应结构...');
    console.log('='.repeat(50));

    // 测试登录接口
    await testLoginResponse();
    console.log('-'.repeat(30));

    // 测试仪表板接口
    await testDashboardResponse();
    console.log('-'.repeat(30));

    // 测试用户信息接口
    await testUserInfoResponse();

    console.log('='.repeat(50));
    console.log('✅ API 响应结构测试完成');
};

// 在浏览器控制台中可以调用这些函数进行测试
// window.testAllApiResponses = testAllApiResponses;
// window.testLoginResponse = testLoginResponse;