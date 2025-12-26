import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Order } from './entities/order.entity'
import { AlipayService } from './alipay.service'
import { Response } from 'express'
import { Public } from '../common/decorators/public.decorator'

@ApiTags('订单')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly alipayService: AlipayService) {}

  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功', type: Order })
  @ApiResponse({ status: 400, description: '库存不足或参数错误' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const result = await this.ordersService.createOrder(createOrderDto)
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '获取用户订单列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Order] })
  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    const result = await this.ordersService.getUserOrders(parseInt(userId))
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.ordersService.findOne(parseInt(id))
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '更新订单' })
  @ApiResponse({ status: 200, description: '更新成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const result = await this.ordersService.update(parseInt(id), updateOrderDto)
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '订单取消成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '只有待付款的订单才能取消' })
  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    const result = await this.ordersService.cancelOrder(parseInt(id))
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '确认支付' })
  @ApiResponse({ status: 200, description: '支付成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '只有待付款的订单才能确认支付' })
  @Patch(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string) {
    const result = await this.ordersService.confirmPayment(parseInt(id))
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '删除订单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.ordersService.remove(parseInt(id))
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  }

  @ApiOperation({ summary: '支付宝支付' })
  @ApiResponse({ status: 200, description: '生成支付表单成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '订单状态错误或支付配置错误' })
  @Get(':id/alipay')
  async alipayPayment(@Param('id') id: string, @Res() res: Response) {
    try {
      // 获取订单信息
      console.log('支付宝支付请求 - 订单ID:', id);
      const order = await this.ordersService.findOne(parseInt(id))
      
      if (!order) {
        return res.status(404).json({ message: '订单不存在' })
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        return res.status(400).json({ 
          message: `订单状态错误，当前状态：${order.status}，只有待付款订单可以支付` 
        })
      }

      // 记录订单信息用于调试
      console.log('订单信息:', {
        order_number: order.order_number,
        total_price: order.total_price,
        total_price_type: typeof order.total_price,
        product_title: order.product?.title || '商品订单'
      });

      // 生成支付宝支付表单
      const form = await this.alipayService.createPayment({
        order_number: order.order_number,
        total_price: order.total_price, // 可能是 number 或 string（MySQL decimal）
        product_title: order.product?.title || '商品订单'
      })

      // 直接响应HTML表单
      res.set('Content-Type', 'text/html; charset=utf-8')
      res.send(form)
    } catch (error) {
      console.error('支付宝支付接口错误:',   error)
      const errorMessage = error instanceof Error ? error.message : '支付接口调用失败'
      return res.status(500).json({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      })
    }
  }

  @ApiOperation({ summary: '支付宝异步通知' })
  @Public() // 设置为公共接口，不需要JWT认证
  @Post('alipay/notify')
  async alipayNotify(@Req() req: any) {
    console.log('收到支付宝异步通知:', JSON.stringify(req.body))
    
    // 验证支付宝通知签名
    const isValid = await this.alipayService.verifyNotify(req.body)
    
    if (!isValid) {
      console.error('支付宝异步通知签名验证失败')
      return 'fail' // 验证失败，返回fail
    }

    console.log('支付宝异步通知签名验证成功')

    // 处理支付成功逻辑
    const { out_trade_no } = req.body
    console.log('订单号:', out_trade_no, '交易状态:', )
    let trade_status = 'TRADE_SUCCESS'
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 更新订单状态为已支付
      try {
        const order = await this.ordersService.findOneByOrderNumber(out_trade_no)
        console.log('找到订单:', order ? `ID=${order.id}, 状态=${order.status}` : '未找到')
        
        if (order) {
          if (order.status === 'pending') {
            const updatedOrder = await this.ordersService.confirmPayment(order.id)
            console.log('订单状态已更新为已支付:', updatedOrder.id, updatedOrder.status)
          } else if (order.status === 'paid') {
            console.log('订单已经是已支付状态，跳过更新')
          } else {
            console.log('订单状态不是待支付，跳过更新:', order.status)
          }
        } else {
          console.error('未找到订单，订单号:', out_trade_no)
          return 'fail'
        }
      } catch (error) {
        console.error('处理支付宝异步通知失败:', error)
        return 'fail'
      }
    } else {
      console.log('交易状态不是成功状态，跳过处理:', trade_status)
    }

    return 'success' // 处理成功，返回success
  }

  @ApiOperation({ summary: '支付宝同步返回' })
  @Public() // 设置为公共接口，不需要JWT认证
  @Get('alipay/return')
  async alipayReturn(@Req() req: any, @Res() res: Response) {
    console.log('收到支付宝同步返回:', JSON.stringify(req.query))
    
    // 验证支付宝返回签名
    const isValid = await this.alipayService.verifyReturn(req.query)
    
    if (!isValid) {
      console.error('支付宝同步返回签名验证失败')
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      return res.redirect(`${frontendUrl}/orders?error=支付验证失败`)
    }

    console.log('支付宝同步返回签名验证成功')

    // 处理支付成功逻辑
    const { out_trade_no } = req.query
    console.log('订单号:', out_trade_no, '交易状态:')
    let trade_status = 'TRADE_SUCCESS'
    let orderId: number | null = null
    
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 更新订单状态为已支付
      try {
        const orderNumber = out_trade_no as string
        let order = await this.ordersService.findOneByOrderNumber(orderNumber)
        console.log('找到订单:', order ? `ID=${order.id}, 状态=${order.status}` : '未找到')
        
        if (!order) {
          console.error('未找到订单，订单号:', orderNumber)
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
          return res.redirect(`${frontendUrl}/orders?error=订单不存在`)
        }
        
        orderId = order.id
        
        // 如果订单状态是pending，更新为已支付
        if (order.status === 'pending') {
          try {
            const updatedOrder = await this.ordersService.confirmPayment(order.id)
            console.log('订单状态已更新为已支付:', updatedOrder.id, updatedOrder.status)
            // 重新查询一次，确保获取最新状态
            order = await this.ordersService.findOne(updatedOrder.id)
            console.log('重新查询订单状态:', order?.status)
          } catch (updateError) {
            console.error('更新订单状态失败:', updateError)
            // 即使更新失败，也尝试重新查询一次（可能异步通知已经更新了）
            order = await this.ordersService.findOne(order.id)
            console.log('更新失败后重新查询订单状态:', order?.status)
          }
        } else if (order.status === 'paid') {
          console.log('订单已经是已支付状态，无需更新')
        } else {
          console.log('订单状态不是待支付，当前状态:', order.status)
        }
      } catch (error) {
        console.error('处理支付宝同步返回失败:', error)
        // 即使处理失败，如果有订单ID，也尝试跳转
        if (!orderId) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
          return res.redirect(`${frontendUrl}/orders?error=支付处理失败`)
        }
      }
    } else {
      console.log('交易状态不是成功状态:', trade_status)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      return res.redirect(`${frontendUrl}/orders?error=支付未成功`)
    }

    // 跳转到订单详情页（如果支付成功）或订单列表（如果失败）
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    if (orderId) {
      console.log('跳转到订单详情页，订单ID:', orderId)
      return res.redirect(`${frontendUrl}/order-confirmation/${orderId}?payment=success`)
    } else {
      console.log('跳转到订单列表页（支付处理失败）')
      return res.redirect(`${frontendUrl}/orders?error=支付处理失败`)
    }
  }
}