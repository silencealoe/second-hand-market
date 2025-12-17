import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Order } from './entities/order.entity'
import { AlipayService } from './alipay.service'
import { Response } from 'express'

@ApiTags('订单')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly alipayService: AlipayService) {}

  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功', type: Order })
  @ApiResponse({ status: 400, description: '库存不足或参数错误' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto)
  }

  @ApiOperation({ summary: '获取用户订单列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Order] })
  @Get('user/:userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.ordersService.getUserOrders(parseInt(userId))
  }

  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(parseInt(id))
  }

  @ApiOperation({ summary: '更新订单' })
  @ApiResponse({ status: 200, description: '更新成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(parseInt(id), updateOrderDto)
  }

  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '订单取消成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '只有待付款的订单才能取消' })
  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(parseInt(id))
  }

  @ApiOperation({ summary: '确认支付' })
  @ApiResponse({ status: 200, description: '支付成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '只有待付款的订单才能确认支付' })
  @Patch(':id/confirm-payment')
  confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(parseInt(id))
  }

  @ApiOperation({ summary: '删除订单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(parseInt(id))
  }

  @ApiOperation({ summary: '支付宝支付' })
  @ApiResponse({ status: 200, description: '生成支付表单成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Get(':id/alipay')
  async alipayPayment(@Param('id') id: string, @Res() res: Response) {
    // 获取订单信息
    const order = await this.ordersService.findOne(parseInt(id))
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' })
    }

    // 生成支付宝支付表单
    const form = await this.alipayService.createPayment({
      order_number: order.order_number,
      total_price: order.total_price,
      product_title: order.product?.title || '商品订单'
    })

    // 直接响应HTML表单
    res.set('Content-Type', 'text/html; charset=utf-8')
    res.send(form)
  }

  @ApiOperation({ summary: '支付宝异步通知' })
  @Post('alipay/notify')
  async alipayNotify(@Req() req: any) {
    // 验证支付宝通知签名
    const isValid = await this.alipayService.verifyNotify(req.body)
    
    if (!isValid) {
      return 'fail' // 验证失败，返回fail
    }

    // 处理支付成功逻辑
    const { out_trade_no, trade_status } = req.body
    
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 更新订单状态为已支付
      try {
        const order = await this.ordersService.findOneByOrderNumber(out_trade_no)
        if (order && order.status === 'pending') {
          await this.ordersService.confirmPayment(order.id)
        }
      } catch (error) {
        console.error('处理支付宝异步通知失败:', error)
        return 'fail'
      }
    }

    return 'success' // 处理成功，返回success
  }

  @ApiOperation({ summary: '支付宝同步返回' })
  @Get('alipay/return')
  async alipayReturn(@Req() req: any, @Res() res: Response) {
    // 验证支付宝返回签名
    const isValid = await this.alipayService.verifyReturn(req.query)
    
    if (!isValid) {
      return res.redirect('/orders?error=支付失败')
    }

    // 处理支付成功逻辑
    const { out_trade_no, trade_status } = req.query
    
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 更新订单状态为已支付
      try {
        const order = await this.ordersService.findOneByOrderNumber(out_trade_no as string)
        if (order && order.status === 'pending') {
          await this.ordersService.confirmPayment(order.id)
        }
      } catch (error) {
        console.error('处理支付宝同步返回失败:', error)
      }
    }

    // 跳转到订单列表页面
    return res.redirect('/orders')
  }
}