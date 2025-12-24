import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

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
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 核心指标数据
   */
  async getCoreMetrics(startDate?: Date, endDate?: Date) {
    const dateCondition = this.buildDateCondition(startDate, endDate);
    
    // 今日订单数 - 使用QueryBuilder避免类型问题
    const todayOrdersQuery = this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt BETWEEN :todayStart AND :todayEnd', {
        todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
        todayEnd: new Date(new Date().setHours(23, 59, 59, 999)),
      });

    if (dateCondition) {
      todayOrdersQuery.andWhere('order.createdAt BETWEEN :conditionStart AND :conditionEnd', {
        conditionStart: dateCondition.createdAt.value[0],
        conditionEnd: dateCondition.createdAt.value[1],
      });
    }

    const todayOrders = await todayOrdersQuery.getCount();

    // 今日成交额
    const todayRevenueQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt BETWEEN :start AND :end', {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      })
      .andWhere('order.status = :status', { status: 'completed' });

    if (dateCondition) {
      todayRevenueQuery.andWhere('order.createdAt BETWEEN :conditionStart AND :conditionEnd', {
        conditionStart: dateCondition.createdAt.value[0],
        conditionEnd: dateCondition.createdAt.value[1],
      });
    }

    const todayRevenue = await todayRevenueQuery.getRawOne();

    // 累计用户数 - 使用QueryBuilder
    const totalUsersQuery = this.userRepository.createQueryBuilder('user');
    if (dateCondition) {
      totalUsersQuery.where('user.createdAt BETWEEN :conditionStart AND :conditionEnd', {
        conditionStart: dateCondition.createdAt.value[0],
        conditionEnd: dateCondition.createdAt.value[1],
      });
    }
    const totalUsers = await totalUsersQuery.getCount();

    // 在售商品数 - 使用QueryBuilder
    const activeProductsQuery = this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 'active' });
    
    if (dateCondition) {
      activeProductsQuery.andWhere('product.createdAt BETWEEN :conditionStart AND :conditionEnd', {
        conditionStart: dateCondition.createdAt.value[0],
        conditionEnd: dateCondition.createdAt.value[1],
      });
    }
    
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
   * @param days 统计天数
   * @returns 销售趋势数据
   */
  async getSalesTrend(period: 'day' | 'week' | 'month' = 'day', days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const results = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'DATE(order.createdAt) as date',
        'COUNT(*) as orderCount',
        'SUM(order.totalAmount) as revenue',
      ])
      .where('order.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map(item => ({
      date: item.date,
      orderCount: parseInt(item.orderCount),
      revenue: parseFloat(item.revenue || '0'),
    }));
  }

  /**
   * 获取商品分类分布数据（简化版本）
   * @returns 分类分布数据
   */
  async getCategoryDistribution() {
    const results = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'category.name as categoryName',
        'COUNT(product.id) as productCount',
      ])
      .where('category.id IS NOT NULL')
      .andWhere('product.status = :status', { status: 'active' })
      .groupBy('category.id, category.name')
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
   * @returns 热门商品排行
   */
  async getTopProducts(limit: number = 10) {
    const results = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'product.id as productId',
        'product.name as productName',
        'category.name as categoryName',
        'product.price as price',
        'product.viewCount as viewCount',
        'product.likeCount as likeCount',
      ])
      .where('product.status = :status', { status: 'active' })
      .orderBy('product.viewCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(item => ({
      productId: item.productId,
      productName: item.productName,
      categoryName: item.categoryName,
      price: parseFloat(item.price),
      viewCount: parseInt(item.viewCount),
      likeCount: parseInt(item.likeCount),
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
        'DATE(user.createdAt) as date',
        'COUNT(*) as userCount',
      ])
      .where('user.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('DATE(user.createdAt)')
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
      .where('user.createdAt >= :date', { date: oneHourAgo })
      .getCount();

    // 最近1小时新增订单 - 使用QueryBuilder
    const newOrdersLastHour = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :date', { date: oneHourAgo })
      .getCount();

    // 最近1小时成交额
    const revenueLastHour = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt >= :date', { date: oneHourAgo })
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