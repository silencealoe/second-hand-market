import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import * as XLSX from 'xlsx';

/**
 * 数据大屏统计服务
 * 负责Dashboard大屏的核心数据统计和图表数据生成
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取核心指标数据
   * @param period 统计周期：day, week, month
   * @returns 核心指标数据
   */
  async getCoreMetrics(period: 'day' | 'week' | 'month' = 'day') {
    const endDate = new Date();
    
    // 根据period参数调整统计天数
    let actualDays: number;
    switch (period) {
      case 'day':
        actualDays = 1; // 当天24小时的数据
        break;
      case 'week':
        actualDays = 7; // 7天的数据
        break;
      case 'month':
      default:
        actualDays = 30; // 30天的数据
        break;
    }
    
    // 计算开始日期
    let startDate: Date;
    if (period === 'day') {
      // 当天24小时的数据，startDate是当天的开始时间（00:00:00）
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // 其他情况，根据实际天数计算startDate
      startDate = new Date(endDate.getTime() - (actualDays - 1) * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    }
    
    // 今日订单数 - 使用QueryBuilder避免类型问题
    const todayOrdersQuery = this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at BETWEEN :todayStart AND :todayEnd', {
        todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
        todayEnd: new Date(new Date().setHours(23, 59, 59, 999)),
      })
      .andWhere('order.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });

    const todayOrders = await todayOrdersQuery.getCount();

    // 今日成交额
    const todayRevenueQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_price)', 'total')
      .where('order.created_at BETWEEN :todayStart AND :todayEnd', {
        todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
        todayEnd: new Date(new Date().setHours(23, 59, 59, 999)),
      })
      .andWhere('order.status = :status', { status: 'completed' })
      .andWhere('order.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });

    const todayRevenue = await todayRevenueQuery.getRawOne();

    // 累计用户数 - 使用QueryBuilder
    const totalUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    
    const totalUsers = await totalUsersQuery.getCount();

    // 在售商品数 - 使用QueryBuilder
    const activeProductsQuery = this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 'on_sale' })
      .andWhere('product.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    
    const activeProducts = await activeProductsQuery.getCount();

    return {
      todayOrders,
      todayRevenue: parseFloat(todayRevenue?.total || '0'),
      totalUsers,
      activeProducts,
    };
  }



  /**
   * 获取销售趋势数据（简化版本）
   * @param period 统计周期：day, week, month
   * @param days 统计天数（可选，默认根据period参数自动调整）
   * @returns 销售趋势数据
   */
  async getSalesTrend(period: 'day' | 'week' | 'month' = 'day', days?: number) {
    const endDate = new Date();
    
    // 根据period参数调整统计天数
    let actualDays: number;
    if (days) {
      actualDays = days;
    } else {
      switch (period) {
        case 'day':
          actualDays = 1; // 当天24小时的数据
          break;
        case 'week':
          actualDays = 7; // 7天的数据
          break;
        case 'month':
        default:
          actualDays = 30; // 30天的数据
          break;
      }
    }
    
    let startDate: Date;
    if (period === 'day') {
      // 当天24小时的数据，startDate是当天的开始时间（00:00:00）
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // 其他情况，根据实际天数计算startDate
      // 计算完整的时间范围，例如7天应该是从今天往前推6天（包括今天共7天）
      // 但为了确保包含所有数据，我们需要将时间设置为当天的开始时间
      startDate = new Date(endDate.getTime() - (actualDays - 1) * 24 * 60 * 60 * 1000);
      // 设置为当天的开始时间
      startDate.setHours(0, 0, 0, 0);
    }
    
    // 输出调试信息
    console.log('Sales Trend Debug:', {
      period,
      actualDays,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // 根据period参数确定日期格式化和分组方式
    let dateFormat: string;
    let groupBy: string;
    
    switch (period) {
      case 'day':
        // 当天24小时的数据，按小时分组
        dateFormat = 'DATE_FORMAT(order.created_at, "%Y-%m-%d %H:00:00") as date';
        groupBy = dateFormat.replace(' as date', ''); // 使用与SELECT列表完全相同的表达式进行分组
        break;
      case 'week':
        // 7天的数据，按天分组
        dateFormat = 'DATE(order.created_at) as date';
        groupBy = dateFormat.replace(' as date', ''); // 使用与SELECT列表完全相同的表达式进行分组
        break;
      case 'month':
        // 30天的数据，按天分组
        dateFormat = 'DATE(order.created_at) as date';
        groupBy = dateFormat.replace(' as date', ''); // 使用与SELECT列表完全相同的表达式进行分组
        break;
      default:
        // 默认按天分组
        dateFormat = 'DATE(order.created_at) as date';
        groupBy = dateFormat.replace(' as date', ''); // 使用与SELECT列表完全相同的表达式进行分组
        break;
    }
    
    const results = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        dateFormat,
        'COUNT(*) as orderCount',
        'SUM(order.quantity) as salesCount', // 将订单数量改为销量（quantity总和）
        'SUM(order.total_price) as revenue',
      ])
      .where('order.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      // 暂时移除status筛选，看看是否能返回数据
      // .andWhere('order.status = :status', { status: 'paid' })
      .groupBy(groupBy)
      .orderBy('date', 'ASC')
      .getRawMany();

    // 输出查询结果
    console.log('Sales Trend Query Results:', results);

    // 将结果转换为Map以便快速查找，确保日期格式一致
    const resultsMap = new Map(results.map(item => {
      // 将SQL返回的Date对象转换为字符串格式（YYYY-MM-DD）
      const dateStr = item.date instanceof Date 
        ? item.date.toISOString().slice(0, 10) 
        : item.date;
      return [dateStr, item];
    }));
    console.log('Results Map Keys:', Array.from(resultsMap.keys()));

    // 生成所有日期的数组并填充零值
    const allDates = this.generateDateRange(startDate, endDate, period);
    console.log('Generated All Dates:', allDates);
    
    const finalResults = allDates.map(date => {
      const item = resultsMap.get(date);
      return {
        date,
        orderCount: item ? parseInt(item.orderCount) : 0,
        salesCount: item ? parseInt(item.salesCount || '0') : 0,
        revenue: item ? parseFloat(item.revenue || '0') : 0,
      };
    });
    
    console.log('Final Results:', finalResults);
    return finalResults;
  }

  /**
   * 生成指定日期范围内的日期数组
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param period 统计周期
   * @returns 日期数组
   */
  private generateDateRange(startDate: Date, endDate: Date, period: 'day' | 'week' | 'month'): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let formattedDate: string;
      
      switch (period) {
        case 'day':
          // 当天24小时的数据，按小时生成
          for (let hour = 0; hour < 24; hour++) {
            const hourDate = new Date(currentDate);
            hourDate.setHours(hour, 0, 0, 0);
            // 生成与SQL查询相同格式的日期字符串：YYYY-MM-DD HH:00:00
            const year = hourDate.getFullYear();
            const month = String(hourDate.getMonth() + 1).padStart(2, '0');
            const day = String(hourDate.getDate()).padStart(2, '0');
            const hours = String(hour).padStart(2, '0');
            formattedDate = `${year}-${month}-${day} ${hours}:00:00`;
            dates.push(formattedDate);
          }
          // 结束循环，因为已经生成了当天所有小时
          currentDate.setTime(endDate.getTime() + 1);
          break;
        case 'week':
        case 'month':
        default:
          // 按天生成
          formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
          dates.push(formattedDate);
          // 跳到下一天
          currentDate.setDate(currentDate.getDate() + 1);
          break;
      }
    }

    return dates;
  }

  /**
   * 获取商品分类分布数据（简化版本）
   * @param period 统计周期：day, week, month
   * @returns 分类分布数据
   */
  async getCategoryDistribution(period: 'day' | 'week' | 'month' = 'day') {
    const endDate = new Date();
    
    // 根据period参数调整统计天数
    let actualDays: number;
    switch (period) {
      case 'day':
        actualDays = 1; // 当天24小时的数据
        break;
      case 'week':
        actualDays = 7; // 7天的数据
        break;
      case 'month':
      default:
        actualDays = 30; // 30天的数据
        break;
    }
    
    // 计算开始日期
    let startDate: Date;
    if (period === 'day') {
      // 当天24小时的数据，startDate是当天的开始时间（00:00:00）
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // 其他情况，根据实际天数计算startDate
      startDate = new Date(endDate.getTime() - (actualDays - 1) * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    }

    const results = await this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.category as categoryName',
        'COUNT(product.id) as productCount',
      ])
      .where('product.category IS NOT NULL AND product.category != :empty', { empty: '' })
      .andWhere('product.status = :status', { status: 'on_sale' })
      .andWhere('product.created_at BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('product.category')
      .getRawMany();

    const total = results.reduce((sum, item) => sum + parseInt(item.productCount), 0);

    return results.map(item => ({
      categoryName: item.categoryName,
      productCount: parseInt(item.productCount),
      percentage: total > 0 ? (parseInt(item.productCount) / total) * 100 : 0,
    }));
  }

  /**
   * 获取热门商品排行（简化版本）
   * @param limit 限制数量
   * @param period 统计周期：day, week, month
   * @returns 热门商品排行
   */
  async getTopProducts(limit: number = 10, period: 'day' | 'week' | 'month' = 'day') {
    const endDate = new Date();
    
    // 根据period参数调整统计天数
    let actualDays: number;
    switch (period) {
      case 'day':
        actualDays = 1; // 当天24小时的数据
        break;
      case 'week':
        actualDays = 7; // 7天的数据
        break;
      case 'month':
      default:
        actualDays = 30; // 30天的数据
        break;
    }
    
    // 计算开始日期
    let startDate: Date;
    if (period === 'day') {
      // 当天24小时的数据，startDate是当天的开始时间（00:00:00）
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // 其他情况，根据实际天数计算startDate
      startDate = new Date(endDate.getTime() - (actualDays - 1) * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    }

    const results = await this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.id as productId',
        'product.title as productName',
        'product.category as categoryName',
        'product.price as price',
        'product.view_count as viewCount',
      ])
      .where('product.status = :status', { status: 'on_sale' })
      .andWhere('product.created_at BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('product.view_count', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(item => ({
      productId: item.productId,
      productName: item.productName,
      categoryName: item.categoryName,
      price: parseFloat(item.price),
      viewCount: parseInt(item.viewCount),
      likeCount: 0, // 没有like_count字段，返回默认值
    }));
  }

  /**
   * 获取用户增长数据
   * @param days 统计天数
   * @returns 用户增长数据
   */
  async getUserGrowth(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const results = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'DATE(user.created_at) as date',
        'COUNT(*) as userCount',
      ])
      .where('user.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('DATE(user.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map(item => ({
      date: item.date,
      userCount: parseInt(item.userCount),
    }));
  }

  /**
   * 获取实时数据
   * @returns 实时数据
   */
  async getRealTimeData() {
    // 最近1小时新增用户 - 使用QueryBuilder
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const newUsersLastHour = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: oneHourAgo })
      .getCount();

    // 最近1小时新增订单 - 使用QueryBuilder
    const newOrdersLastHour = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :date', { date: oneHourAgo })
      .getCount();

    // 最近1小时成交额
    const revenueLastHour = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_price)', 'total')
      .where('order.created_at >= :date', { date: oneHourAgo })
      .andWhere('order.status = :status', { status: 'completed' })
      .getRawOne();

    return {
      newUsersLastHour,
      newOrdersLastHour,
      revenueLastHour: parseFloat(revenueLastHour?.total || '0'),
      timestamp: new Date(),
    };
  }

  /**
   * 导出销售趋势数据到Excel
   * @param period 统计周期：day, week, month
   * @param days 统计天数（可选）
   * @returns Excel文件的Buffer数据
   */
  async exportSalesTrendToExcel(period: 'day' | 'week' | 'month' = 'day', days?: number) {
    // 先获取销售趋势数据
    const salesTrendData = await this.getSalesTrend(period, days);

    // 准备Excel数据
    const excelData = salesTrendData.map(item => ({
      日期: item.date,
      订单数: item.orderCount,
      销量: item.salesCount,
      成交额: item.revenue,
    }));

    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '销售趋势数据');

    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, // 日期列宽
      { wch: 10 }, // 订单数列宽
      { wch: 10 }, // 销量列宽
      { wch: 15 }, // 成交额列宽
    ];

    // 生成Excel文件的Buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return excelBuffer;
  }

  /**
   * 构建日期查询条件
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 日期查询条件
   */
  private buildDateCondition(startDate?: Date, endDate?: Date): { createdAt: any } | null {
    if (!startDate || !endDate) return null;
    
    // 创建新的日期对象，避免修改原始日期
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return {
      createdAt: Between(start, end)
    } as any;
  }
}