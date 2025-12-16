import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Order } from './entities/order.entity'

@ApiTags('订单')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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

  @ApiOperation({ summary: '删除订单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(parseInt(id))
  }
}