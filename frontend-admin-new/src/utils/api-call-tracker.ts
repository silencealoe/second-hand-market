/**
 * API 调用追踪工具
 * 用于监控和调试 API 调用次数
 */

interface ApiCall {
    url: string;
    method: string;
    timestamp: number;
    params?: any;
}

class ApiCallTracker {
    private calls: ApiCall[] = [];
    private isEnabled: boolean = false;

    // 启用追踪
    enable() {
        this.isEnabled = true;
        this.calls = [];
        console.log('🔍 API 调用追踪已启用');
    }

    // 禁用追踪
    disable() {
        this.isEnabled = false;
        console.log('🔍 API 调用追踪已禁用');
    }

    // 记录 API 调用
    track(url: string, method: string, params?: any) {
        if (!this.isEnabled) return;

        const call: ApiCall = {
            url,
            method: method.toUpperCase(),
            timestamp: Date.now(),
            params
        };

        this.calls.push(call);
        console.log(`📞 API 调用 #${this.calls.length}:`, call);
    }

    // 获取调用统计
    getStats() {
        if (!this.isEnabled) {
            console.warn('API 追踪未启用，请先调用 enable()');
            return null;
        }

        const stats = {
            totalCalls: this.calls.length,
            uniqueEndpoints: new Set(this.calls.map(call => `${call.method} ${call.url}`)).size,
            callsByEndpoint: this.getCallsByEndpoint(),
            duplicateCalls: this.getDuplicateCalls(),
            timeline: this.calls
        };

        console.log('📊 API 调用统计:', stats);
        return stats;
    }

    // 按端点分组统计
    private getCallsByEndpoint() {
        const grouped: Record<string, number> = {};
        this.calls.forEach(call => {
            const key = `${call.method} ${call.url}`;
            grouped[key] = (grouped[key] || 0) + 1;
        });
        return grouped;
    }

    // 检测重复调用
    private getDuplicateCalls() {
        const duplicates: Record<string, ApiCall[]> = {};
        const grouped = this.groupCallsByEndpoint();

        Object.entries(grouped).forEach(([endpoint, calls]) => {
            if (calls.length > 1) {
                // 检查是否在短时间内重复调用
                const recentCalls = calls.filter((call, index) => {
                    if (index === 0) return false;
                    const prevCall = calls[index - 1];
                    return call.timestamp - prevCall.timestamp < 1000; // 1秒内的重复调用
                });

                if (recentCalls.length > 0) {
                    duplicates[endpoint] = calls;
                }
            }
        });

        return duplicates;
    }

    // 按端点分组调用
    private groupCallsByEndpoint() {
        const grouped: Record<string, ApiCall[]> = {};
        this.calls.forEach(call => {
            const key = `${call.method} ${call.url}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(call);
        });
        return grouped;
    }

    // 清除记录
    clear() {
        this.calls = [];
        console.log('🧹 API 调用记录已清除');
    }

    // 检查 Dashboard 页面的调用情况
    checkDashboardCalls() {
        const dashboardEndpoints = [
            '/admin/dashboard/core-metrics',
            '/admin/dashboard/sales-trend',
            '/admin/dashboard/category-distribution',
            '/admin/dashboard/order-status-distribution',
            '/admin/dashboard/top-products'
        ];

        const dashboardCalls = this.calls.filter(call =>
            dashboardEndpoints.some(endpoint => call.url.includes(endpoint))
        );

        const analysis = {
            totalDashboardCalls: dashboardCalls.length,
            expectedCalls: dashboardEndpoints.length,
            isOptimal: dashboardCalls.length === dashboardEndpoints.length,
            callsByEndpoint: this.getCallsByEndpoint(),
            duplicates: this.getDuplicateCalls()
        };

        console.log('📈 Dashboard API 调用分析:', analysis);

        if (analysis.isOptimal) {
            console.log('✅ Dashboard API 调用已优化，没有重复调用');
        } else {
            console.warn('⚠️ Dashboard API 调用可能存在问题：');
            console.warn(`   预期调用次数: ${analysis.expectedCalls}`);
            console.warn(`   实际调用次数: ${analysis.totalDashboardCalls}`);
        }

        return analysis;
    }
}

// 创建全局实例
export const apiTracker = new ApiCallTracker();

// 在开发环境中暴露到 window 对象
if (import.meta.env.DEV) {
    (window as any).apiTracker = apiTracker;
}

// 使用示例：
// 在浏览器控制台中：
// apiTracker.enable()           // 启用追踪
// // 然后访问 Dashboard 页面
// apiTracker.checkDashboardCalls()  // 检查调用情况
// apiTracker.getStats()         // 获取详细统计
// apiTracker.disable()          // 禁用追踪