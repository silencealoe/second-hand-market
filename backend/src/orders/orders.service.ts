import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Order } from './entities/order.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Product } from '../products/entities/product.entity'
import { Cart } from '../carts/entities/cart.entity'
import Redis from 'ioredis'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)

  // Redis 客户端和订阅客户端（用于监听过期事件）
  private static redisClient: Redis | null = null
  private static redisSubscriber: Redis | null = null
  private static redisInitialized = false

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly dataSource: DataSource,
  ) {
    // 初始化 Redis（只初始化一次）
    if (!OrdersService.redisInitialized) {
      OrdersService.redisInitialized = true
      const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
      try {
        OrdersService.redisClient = new Redis(redisUrl)
        OrdersService.redisSubscriber = new Redis(redisUrl)

        // 订阅 key 过期事件（需要在 Redis 配置中开启：notify-keyspace-events Ex）
        OrdersService.redisSubscriber.subscribe('__keyevent@0__:expired', (err) => {
          if (err) {
            this.logger.error('Redis 订阅过期事件失败', err)
          } else {
            this.logger.log('Redis 过期事件订阅成功')
          }
        })

        OrdersService.redisSubscriber.on('message', async (_channel, key) => {
          // 只处理订单过期键：order:expire:{id}
          if (!key.startsWith('order:expire:')) return
          const idStr = key.split(':')[2]
          const id = parseInt(idStr, 10)
          if (Number.isNaN(id)) return

          this.logger.log(`收到订单过期事件，订单ID: ${id}`)

          try {
            // 调用取消订单逻辑（内部会校验状态是否为 pending）
            await this.cancelOrder(id)
            this.logger.log(`订单 ${id} 已因超时自动取消`)
          } catch (error: any) {
            // 如果订单已被手动取消或已支付，忽略状态错误
            if (
              error instanceof BadRequestException &&
              error.message.includes('只有待付款的订单才能取消')
            ) {
              this.logger.log(`订单 ${id} 状态已变更（可能已支付或已取消），忽略过期事件`)
            } else {
              this.logger.error(`处理订单过期事件失败 (ID: ${id})`, error?.stack || error)
            }
          }
        })
      } catch (error) {
        this.logger.error('初始化 Redis 客户端失败，将无法使用过期自动取消功能', error as any)
      }
    }
  }

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

      // 4. 生成订单记录（状态为待付款）
      const order = new Order()
      order.order_number = this.generateOrderNumber()
      order.user_id = user_id
      order.product_id = product_id
      order.quantity = quantity
      order.unit_price = product.price
      order.total_price = product.price * quantity
      order.shipping_address = shipping_address
      order.payment_method = payment_method
      order.status = 'pending'

      const savedOrder = await queryRunner.manager.save(Order, order)

      // 为订单创建 Redis 过期键（15 秒未支付自动取消）
      try {
        if (OrdersService.redisClient) {
          const ttlSeconds = 15
          await OrdersService.redisClient.set(
            `order:expire:${savedOrder.id}`,
            '1',
            'EX',
            ttlSeconds,
          )
          this.logger.log(`为订单 ${savedOrder.id} 设置 Redis 过期键，TTL=${ttlSeconds}s`)
        } else {
          this.logger.warn('Redis 客户端未初始化，无法设置订单过期键')
        }
      } catch (redisError) {
        this.logger.error('设置订单过期 Redis 键失败', redisError as any)
      }

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
    return await this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .where('order.user_id = :userId', { userId })
      .orderBy('order.created_at', 'DESC')
      .getMany()
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

  // 根据订单号获取订单
  async findOneByOrderNumber(orderNumber: string) {
    const order = await this.orderRepository.findOne({
      where: { order_number: orderNumber },
      relations: ['product', 'user']
    })

    return order
  }

  // 更新订单状态
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id)
    
    Object.assign(order, updateOrderDto)
    
    return await this.orderRepository.save(order)
  }

  // 取消订单（释放库存）
  async cancelOrder(id: number) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. 获取订单信息
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['product']
      })

      if (!order) {
        throw new NotFoundException('订单不存在')
      }

      if (order.status !== 'pending') {
        throw new BadRequestException('只有待付款的订单才能取消')
      }

      // 2. 释放商品库存
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: order.product_id },
        lock: { mode: 'pessimistic_write' }
      })

      if (!product) {
        throw new NotFoundException('商品不存在')
      }

      product.stock += order.quantity
      await queryRunner.manager.save(Product, product)

      // 3. 更新订单状态为已取消
      order.status = 'cancelled'
      await queryRunner.manager.save(Order, order)

      // 删除 Redis 过期键，避免重复触发
      try {
        if (OrdersService.redisClient) {
          await OrdersService.redisClient.del(`order:expire:${order.id}`)
        }
      } catch (redisError) {
        this.logger.error(`删除订单 ${order.id} 过期键失败`, redisError as any)
      }

      // 提交事务
      await queryRunner.commitTransaction()

      return order
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // 释放查询运行器
      await queryRunner.release()
    }
  }

  // 确认支付（更新订单状态）
  async confirmPayment(id: number) {
    const order = await this.findOne(id)

    if (order.status !== 'pending') {
      throw new BadRequestException('只有待付款的订单才能确认支付')
    }

    // 更新订单状态为已支付
    order.status = 'paid'
    order.paid_at = new Date()

    // 删除 Redis 过期键，避免超时任务错误取消
    try {
      if (OrdersService.redisClient) {
        await OrdersService.redisClient.del(`order:expire:${order.id}`)
      }
    } catch (redisError) {
      this.logger.error(`删除订单 ${order.id} 过期键失败`, redisError as any)
    }

    return await this.orderRepository.save(order)
  }

  // 删除订单
  async remove(id: number) {
    const order = await this.findOne(id)
    
    return await this.orderRepository.remove(order)
  }
}