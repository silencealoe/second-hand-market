import { Controller, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
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
   * @param period 统计周期（day, week, month）
   * @returns 核心指标数据
   */
  @Get('core-metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取核心指标', description: '获取系统核心运营指标数据' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期：day(日), week(周), month(月)', enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCoreMetrics(
    @Query('period') period: 'day' | 'week' | 'month' = 'day'
  ) {
    const result = await this.dashboardService.getCoreMetrics(period);
    
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
   * 导出销售趋势数据到Excel
   * @param period 统计周期（day, week, month）
   * @param days 天数（可选，默认30天）
   * @returns Excel文件
   */
  @Get('export-sales-trend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '导出销售趋势数据', description: '导出指定周期内的销售趋势数据到Excel文件' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期：day(日), week(周), month(月)', enum: ['day', 'week', 'month'] })
  @ApiQuery({ name: 'days', required: false, description: '统计天数，默认30天' })
  @ApiResponse({ status: 200, description: '导出成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async exportSalesTrend(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('days') days: number = 30,
    @Res() res: Response
  ) {
    const excelBuffer = await this.dashboardService.exportSalesTrendToExcel(period, days);
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // 使用encodeURIComponent编码中文文件名，解决中文文件名导致的错误
    const filename = `销售趋势数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    // 返回Excel文件
    return res.send(excelBuffer);
  }

  /**
   * 获取商品分类分布数据
   * @param period 统计周期（day, week, month）
   * @returns 商品分类分布数据
   */
  @Get('category-distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取分类分布', description: '获取商品分类分布统计数据' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期：day(日), week(周), month(月)', enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCategoryDistribution(
    @Query('period') period: 'day' | 'week' | 'month' = 'day'
  ) {
    const result = await this.dashboardService.getCategoryDistribution(period);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取热门商品排行
   * @param limit 限制数量（可选，默认10）
   * @param period 统计周期（day, week, month）
   * @returns 热门商品排行数据
   */
  @Get('top-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取热门商品', description: '获取热门商品排行数据' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量，默认10' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期：day(日), week(周), month(月)', enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTopProducts(
    @Query('limit') limit: number = 10,
    @Query('period') period: 'day' | 'week' | 'month' = 'day'
  ) {
    const result = await this.dashboardService.getTopProducts(limit, period);
    
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

  /**
   * 获取订单状态分布数据（成功支付和取消订单占比）
   * @param period 统计周期（day, week, month）
   * @returns 订单状态分布数据
   */
  @Get('order-status-distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单状态分布', description: '获取订单成功支付和取消订单的分布统计数据' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期：day(日), week(周), month(月)', enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getOrderStatusDistribution(
    @Query('period') period: 'day' | 'week' | 'month' = 'day'
  ) {
    const result = await this.dashboardService.getOrderStatusDistribution(period);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }
}