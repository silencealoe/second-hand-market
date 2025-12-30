/**
 * 测试退出登录功能
 * 这个文件用于验证退出登录接口是否正常工作
 */

import { logout } from '@/services/auth';

export const testLogout = async () => {
    try {
        console.log('开始测试退出登录...');
        await logout();
        console.log('✅ 退出登录接口调用成功');
        return true;
    } catch (error) {
        console.error('❌ 退出登录接口调用失败:', error);
        return false;
    }
};

// 在浏览器控制台中可以调用这个函数进行测试
// window.testLogout = testLogout;