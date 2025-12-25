import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * 后台管理数据大屏控制器
 * 提供数据统计和可视化相关的接口
 */
@ApiTags('后台管理-数据大屏')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取核心指标数据
   * @param startDate 开始日期（可选）
   * @param endDate 结束日期（可选）
   * @returns 核心指标数据
   */
  @Get('core-metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取核心指标', description: '获取系统核心运营指标数据' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期，格式：YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期，格式：YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCoreMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    const result = await this.dashboardService.getCoreMetrics(start, end);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取销售趋势数据
   * @param period 统计周期（day, week, month）
   * @param days 天数（可选，默认30天）
   * @returns 销售趋势数据
   */
  @Get('sales-trend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取销售趋势', description: '获取指定周期内的销售趋势数据' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期：day(日), week(周), month(月)', enum: ['day', 'week', 'month'] })
  @ApiQuery({ name: 'days', required: false, description: '统计天数，默认30天' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getSalesTrend(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('days') days: number = 30
  ) {
    const result = await this.dashboardService.getSalesTrend(period, days);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取商品分类分布数据
   * @returns 商品分类分布数据
   */
  @Get('category-distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取分类分布', description: '获取商品分类分布统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCategoryDistribution() {
    const result = await this.dashboardService.getCategoryDistribution();
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取热门商品排行
   * @param limit 限制数量（可选，默认10）
   * @returns 热门商品排行数据
   */
  @Get('top-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取热门商品', description: '获取热门商品排行数据' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量，默认10' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTopProducts(@Query('limit') limit: number = 10) {
    const result = await this.dashboardService.getTopProducts(limit);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取用户增长数据
   * @param days 天数（可选，默认30天）
   * @returns 用户增长数据
   */
  @Get('user-growth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户增长', description: '获取用户增长趋势数据' })
  @ApiQuery({ name: 'days', required: false, description: '统计天数，默认30天' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getUserGrowth(@Query('days') days: number = 30) {
    const result = await this.dashboardService.getUserGrowth(days);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取实时数据
   * @returns 实时数据统计
   */
  @Get('real-time-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取实时数据', description: '获取系统实时运营数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getRealTimeData() {
    const result = await this.dashboardService.getRealTimeData();
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }
}