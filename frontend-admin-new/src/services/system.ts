import { apiRequest, uploadRequest, exportRequest } from './request';

// 系统配置相关类型
export interface SystemConfig {
    id: string;
    key: string;
    value: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    category: string;
    updatedAt: string;
}

export interface SystemInfo {
    version: string;
    buildTime: string;
    environment: string;
    database: {
        type: string;
        version: string;
        status: 'connected' | 'disconnected';
    };
    redis: {
        version: string;
        status: 'connected' | 'disconnected';
    };
    server: {
        os: string;
        nodeVersion: string;
        memory: {
            used: number;
            total: number;
        };
        cpu: {
            usage: number;
            cores: number;
        };
    };
}

export interface LogEntry {
    id: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: string;
    module: string;
    userId?: string;
    ip?: string;
}

export interface LogQueryParams {
    page?: number;
    pageSize?: number;
    level?: string;
    module?: string;
    startTime?: string;
    endTime?: string;
    keyword?: string;
}

// 获取系统信息
export const getSystemInfo = async (): Promise<SystemInfo> => {
    return apiRequest.get('/admin/system/info');
};

// 获取系统配置列表
export const getSystemConfigs = async (): Promise<SystemConfig[]> => {
    return apiRequest.get('/admin/system/configs');
};

// 更新系统配置
export const updateSystemConfig = async (key: string, value: string): Promise<SystemConfig> => {
    return apiRequest.put(`/admin/system/configs/${key}`, { value });
};

// 批量更新系统配置
export const batchUpdateSystemConfigs = async (configs: Array<{ key: string; value: string }>): Promise<SystemConfig[]> => {
    return apiRequest.put('/admin/system/configs/batch', { configs });
};

// 获取系统日志
export const getSystemLogs = async (params: LogQueryParams) => {
    return apiRequest.get('/admin/system/logs', { params });
};

// 清理系统日志
export const clearSystemLogs = async (beforeDate?: string): Promise<void> => {
    return apiRequest.delete('/admin/system/logs', {
        data: beforeDate ? { beforeDate } : undefined
    });
};

// 导出系统日志 - 使用导出专用实例
export const exportSystemLogs = async (params: LogQueryParams) => {
    return exportRequest.get('/admin/system/logs/export', { params });
};

// 系统健康检查
export const healthCheck = async () => {
    return apiRequest.get('/admin/system/health');
};

// 重启系统服务（谨慎使用）
export const restartService = async (serviceName: string): Promise<void> => {
    return apiRequest.post(`/admin/system/restart/${serviceName}`);
};

// 获取系统统计信息
export const getSystemStats = async (period: 'day' | 'week' | 'month' = 'day') => {
    return apiRequest.get('/admin/system/stats', { params: { period } });
};

// 上传系统备份文件 - 使用上传专用实例
export const uploadSystemBackup = async (file: File) => {
    const formData = new FormData();
    formData.append('backup', file);

    return uploadRequest.post('/admin/system/backup/upload', formData);
};

// 上传系统Logo - 使用上传专用实例
export const uploadSystemLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    return uploadRequest.post('/admin/system/upload-logo', formData);
};