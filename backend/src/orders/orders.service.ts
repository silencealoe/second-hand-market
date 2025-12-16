import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Order } from './entities/order.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Product } from '../products/entities/product.entity'
import { Cart } from '../carts/entities/cart.entity'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly dataSource: DataSource,
  ) {}

  // 生成订单号
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    return `ORD${timestamp}${random}`.toUpperCase()
  }

  // 创建订单（包含事务操作）
  async createOrder(createOrderDto: CreateOrderDto) {
    const { user_id, product_id, quantity, shipping_address, payment_method } = createOrderDto
    
    // 开始事务
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. 检查商品是否存在且库存充足
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: product_id },
        lock: { mode: 'pessimistic_write' }
      })

      if (!product) {
        throw new NotFoundException('商品不存在')
      }

      if (product.stock < quantity) {
        throw new BadRequestException('商品库存不足')
      }

      // 2. 扣减商品库存
      product.stock -= quantity
      await queryRunner.manager.save(Product, product)

      // 3. 删除购物车记录
      await queryRunner.manager.delete(Cart, {
        user_id,
        product_id
      })

      // 4. 生成订单记录
      const order = new Order()
      order.order_number = this.generateOrderNumber()
      order.user_id = user_id
      order.product_id = product_id
      order.quantity = quantity
      order.unit_price = product.price
      order.total_price = product.price * quantity
      order.shipping_address = shipping_address
      order.payment_method = payment_method
      order.status = 'paid'
      order.paid_at = new Date()

      const savedOrder = await queryRunner.manager.save(Order, order)

      // 提交事务
      await queryRunner.commitTransaction()

      // 返回完整的订单信息（包含商品详情）
      return await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['product', 'user']
      })

    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // 释放查询运行器
      await queryRunner.release()
    }
  }

  // 获取用户订单列表
  async getUserOrders(userId: number) {
    return await this.orderRepository.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { created_at: 'DESC' }
    })
  }

  // 获取订单详情
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['product', 'user']
    })

    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    return order
  }

  // 更新订单状态
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id)
    
    Object.assign(order, updateOrderDto)
    
    return await this.orderRepository.save(order)
  }

  // 删除订单
  async remove(id: number) {
    const order = await this.findOne(id)
    
    return await this.orderRepository.remove(order)
  }
}