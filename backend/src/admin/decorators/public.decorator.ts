import { SetMetadata } from '@nestjs/common';

/**
 * 公开接口装饰器常量
 * 用于标记不需要认证的接口
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开接口装饰器
 * 用于标记不需要JWT认证的接口
 * @returns 自定义装饰器
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);