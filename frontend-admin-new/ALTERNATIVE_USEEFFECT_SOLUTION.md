# 替代方案：使用 AbortController 处理 useEffect 双重执行

## 概述

除了使用 useRef 防止重复调用外，还可以使用 AbortController 来取消重复的 API 请求。这种方法更加健壮，特别适合处理异步操作。

## 实现方案

```typescript
useEffect(() => {
    const abortController = new AbortController();
    
    const loadData = async () => {
        console.log('Dashboard useEffect triggered - dimension:', dimension);
        
        try {
            setLoading(true);
            
            // 传递 signal 给 API 调用
            await Promise.all([
                fetchCoreMetrics(abortController.signal),
                fetchSalesTrend(abortController.signal),
                fetchCategoryDistribution(abortController.signal),
                fetchOrderStatusDistribution(abortController.signal),
                fetchTopProducts(abortController.signal),
            ]);
        } catch (error) {
            // 忽略取消的请求
            if (error.name !== 'AbortError') {
                console.error('API 调用失败:', error);
            }
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    };
    
    loadData();
    
    // 清理函数：取消进行中的请求
    return () => {
        console.log('Dashboard useEffect cleanup - aborting requests');
        abortController.abort();
    };
}, [dimension]);
```

## 修改 API 服务函数

需要修改服务函数以支持 AbortController：

```typescript
// services/dashboard.ts
export const getCoreMetrics = async (params: any, signal?: AbortSignal) => {
    return request.get('/admin/dashboard/core-metrics', {
        params,
        signal, // 传递 AbortSignal
    });
};

export const getSalesTrend = async (params: any, signal?: AbortSignal) => {
    return request.get('/admin/dashboard/sales-trend', {
        params,
        signal,
    });
};

// ... 其他 API 函数类似修改
```

## 修改 axios 拦截器

在 `interceptors.ts` 中支持 AbortController：

```typescript
// 请求拦截器
export const createRequestInterceptor = () => {
    return (config: any) => {
        // 支持 AbortController
        if (config.signal) {
            config.cancelToken = new axios.CancelToken((cancel) => {
                config.signal.addEventListener('abort', () => {
                    cancel('Request aborted');
                });
            });
        }
        
        // ... 其他拦截器逻辑
        return config;
    };
};
```

## 优势对比

### useRef 方案（当前实施）
- ✅ 简单易实现
- ✅ 不需要修改 API 服务
- ✅ 性能开销小
- ❌ 只能防止重复调用，不能取消已发出的请求

### AbortController 方案
- ✅ 可以取消进行中的请求
- ✅ 更符合 React 最佳实践
- ✅ 处理组件快速切换的场景更好
- ❌ 需要修改所有 API 服务函数
- ❌ 实现复杂度较高

## 推荐使用场景

1. **当前项目**：使用 useRef 方案，因为简单有效
2. **新项目**：推荐使用 AbortController 方案，更加健壮
3. **API 调用频繁的组件**：推荐使用 AbortController 方案
4. **用户可能快速切换的页面**：推荐使用 AbortController 方案

## 注意事项

1. AbortController 需要浏览器支持（现代浏览器都支持）
2. 需要确保所有 API 服务都支持 signal 参数
3. 错误处理需要区分 AbortError 和其他错误
4. 在组件卸载时确保取消所有进行中的请求