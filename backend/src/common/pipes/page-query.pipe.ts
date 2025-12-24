import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { PageQueryParams } from '../../admin/types/page-query-params.interface';

/**
 * 分页查询参数转换管道
 * 用于统一处理分页查询参数的默认值和类型转换
 */
@Injectable()
export class PageQueryPipe implements PipeTransform {
  /**
   * 转换查询参数
   * @param value 原始查询参数
   * @param metadata 参数元数据
   * @returns 转换后的分页查询参数
   */
  transform(value: any, metadata: ArgumentMetadata): PageQueryParams {
    // 设置默认值和类型转换
    const page = parseInt(value.page, 10) || 1;
    const limit = parseInt(value.limit, 10) || 10;
    const search = value.search || undefined;
    const sortBy = value.sortBy || 'id';
    const sortOrder = (value.sortOrder as 'asc' | 'desc') || 'desc';

    // 确保page和limit为正整数
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 10;

    return {
      page: validPage,
      limit: validLimit,
      search,
      sortBy,
      sortOrder,
    };
  }
}