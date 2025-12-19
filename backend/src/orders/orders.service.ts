import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, LessThan } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { Order } from './entities/order.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Product } from '../products/entities/product.entity'
import { Cart } from '../carts/entities/cart.entity'
import Redis from 'ioredis'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  private readonly paymentTimeoutSeconds: number

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
    private readonly configService: ConfigService,
  ) {
    // 从配置中读取支付超时时间（秒），默认15秒
    this.paymentTimeoutSeconds = parseInt(
      this.configService.get<string>('ORDER_PAYMENT_TIMEOUT') || '15',
      10,
    )
    this.logger.log(`订单支付超时时间配置: ${this.paymentTimeoutSeconds}秒`)
    // 初始化 Redis（只初始化一次）
    if (!OrdersService.redisInitialized) {
      OrdersService.redisInitialized = true
      this.initializeRedis()
    }
  }

  // 初始化 Redis 连接
  private initializeRedis() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379'
    
    try {
      // 创建 Redis 客户端，配置连接选项
      OrdersService.redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          // 最多重试 3 次，然后放弃
          if (times > 3) {
            this.logger.warn('Redis 连接失败，已达到最大重试次数，将使用定时任务作为降级方案')
            return null // 停止重试
          }
          // 指数退避：100ms, 200ms, 400ms
          return Math.min(times * 100, 3000)
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: false, // 禁用就绪检查，避免阻塞
        lazyConnect: true, // 延迟连接，避免启动时阻塞
      })

      OrdersService.redisSubscriber = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 3) {
            return null
          }
          return Math.min(times * 100, 3000)
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
      })

      // 监听连接错误
      OrdersService.redisClient.on('error', (err) => {
        this.logger.warn('Redis 客户端连接错误（将使用定时任务作为降级方案）:', err.message)
        OrdersService.redisClient = null
      })

      OrdersService.redisSubscriber.on('error', (err) => {
        this.logger.warn('Redis 订阅客户端连接错误:', err.message)
        OrdersService.redisSubscriber = null
      })

      // 尝试连接
      OrdersService.redisClient.connect().catch((err) => {
        this.logger.warn('Redis 连接失败，将使用定时任务作为降级方案:', err.message)
        OrdersService.redisClient = null
      })

      OrdersService.redisSubscriber.connect()
        .then(() => {
          // 连接成功后订阅过期事件
          return OrdersService.redisSubscriber!.subscribe('__keyevent@0__:expired')
        })
        .then(() => {
          this.logger.log('Redis 过期事件订阅成功')
          
          OrdersService.redisSubscriber!.on('message', async (_channel, key) => {
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
        })
        .catch((err) => {
          this.logger.warn('Redis 订阅失败，将使用定时任务作为降级方案:', err.message)
          OrdersService.redisSubscriber = null
        })
    } catch (error) {
      this.logger.warn('初始化 Redis 客户端失败，将使用定时任务作为降级方案:', (error as any)?.message)
      OrdersService.redisClient = null
      OrdersService.redisSubscriber = null
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

      // 为订单创建 Redis 过期键（使用配置的超时时间）
      try {
        if (OrdersService.redisClient) {
          await OrdersService.redisClient.set(
            `order:expire:${savedOrder.id}`,
            '1',
            'EX',
            this.paymentTimeoutSeconds,
          ).catch((err) => {
            // Redis 操作失败不影响订单创建，将使用定时任务作为降级方案
            this.logger.warn(`为订单 ${savedOrder.id} 设置 Redis 过期键失败，将使用定时任务:`, err.message)
          })
          this.logger.log(
            `为订单 ${savedOrder.id} 设置 Redis 过期键，TTL=${this.paymentTimeoutSeconds}s`,
          )
        } else {
          this.logger.warn('Redis 客户端未初始化，将使用定时任务作为降级方案')
        }
      } catch (redisError) {
        // Redis 操作失败不影响订单创建，将使用定时任务作为降级方案
        this.logger.warn('设置订单过期 Redis 键失败，将使用定时任务:', (redisError as any)?.message)
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
    const orders = await this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .where('order.user_id = :userId', { userId })
      .orderBy('order.created_at', 'DESC')
      .getMany()

    // 为待支付订单计算剩余支付时间
    return orders.map(order => {
      if (order.status === 'pending') {
        const createdTime = new Date(order.created_at).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - createdTime) / 1000)
        const remainingSeconds = Math.max(0, this.paymentTimeoutSeconds - elapsed)
        
        return {
          ...order,
          remainingPaymentSeconds: remainingSeconds,
          paymentTimeoutSeconds: this.paymentTimeoutSeconds,
        } as Order & { remainingPaymentSeconds: number; paymentTimeoutSeconds: number }
      }
      return order
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

    // 如果是待支付订单，计算剩余支付时间（秒）
    if (order.status === 'pending') {
      const createdTime = new Date(order.created_at).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - createdTime) / 1000)
      const remainingSeconds = Math.max(0, this.paymentTimeoutSeconds - elapsed)
      
      // 将剩余时间附加到订单对象上（不修改实体，只是返回时添加）
      return {
        ...order,
        remainingPaymentSeconds: remainingSeconds,
        paymentTimeoutSeconds: this.paymentTimeoutSeconds,
      } as Order & { remainingPaymentSeconds: number; paymentTimeoutSeconds: number }
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
          await OrdersService.redisClient.del(`order:expire:${order.id}`).catch((err) => {
            // Redis 操作失败不影响业务逻辑
            this.logger.warn(`删除订单 ${order.id} 过期键失败:`, err.message)
          })
        }
      } catch (redisError) {
        // Redis 操作失败不影响业务逻辑
        this.logger.warn(`删除订单 ${order.id} 过期键失败:`, (redisError as any)?.message)
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
  async confirmPayment(id: number, force: boolean = false) {
    const order = await this.findOne(id)

    if (!force && order.status !== 'pending') {
      // 如果订单已经是已支付状态，直接返回
      if (order.status === 'paid') {
        this.logger.log(`订单 ${id} 已经是已支付状态，跳过更新`)
        return order
      }
      throw new BadRequestException('只有待付款的订单才能确认支付')
    }

    // 更新订单状态为已支付
    const oldStatus = order.status
    order.status = 'paid'
    order.paid_at = new Date()

    // 删除 Redis 过期键，避免超时任务错误取消
    try {
      if (OrdersService.redisClient) {
        await OrdersService.redisClient.del(`order:expire:${order.id}`).catch((err) => {
          // Redis 操作失败不影响业务逻辑
          this.logger.warn(`删除订单 ${order.id} 过期键失败:`, err.message)
        })
      }
    } catch (redisError) {
      // Redis 操作失败不影响业务逻辑
      this.logger.warn(`删除订单 ${order.id} 过期键失败:`, (redisError as any)?.message)
    }

    const savedOrder = await this.orderRepository.save(order)
    this.logger.log(`订单 ${id} 状态已从 ${oldStatus} 更新为 ${savedOrder.status}`)
    return savedOrder
  }

  // 删除订单
  async remove(id: number) {
    const order = await this.findOne(id)
    
    return await this.orderRepository.remove(order)
  }

  // 定时任务：自动取消超时未支付的订单（降级方案，当 Redis 不可用时使用）
  // 每秒执行一次，检查是否有超时的待支付订单
  @Cron('* * * * * *') // 每秒执行一次
  async autoCancelExpiredOrdersFallback() {
    // 如果 Redis 可用，则不需要定时任务（Redis 过期事件更高效）
    if (OrdersService.redisClient) {
      return
    }

    let queryRunner = null
    try {
      queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      // 获取超时前创建且状态为 pending 的订单
      const timeoutAgo = new Date()
      timeoutAgo.setSeconds(timeoutAgo.getSeconds() - this.paymentTimeoutSeconds)

      const expiredOrders = await queryRunner.manager.find(Order, {
        where: {
          status: 'pending',
          created_at: LessThan(timeoutAgo)
        },
        relations: ['product']
      })

      if (expiredOrders.length > 0) {
        this.logger.log(`定时任务：发现 ${expiredOrders.length} 个超时订单，开始自动取消`)
        
        for (const order of expiredOrders) {
          try {
            // 1. 释放库存
            const product = await queryRunner.manager.findOne(Product, {
              where: { id: order.product_id },
              lock: { mode: 'pessimistic_write' }
            })

            if (product) {
              product.stock += order.quantity
              await queryRunner.manager.save(Product, product)
            }

            // 2. 更新订单状态为cancelled
            order.status = 'cancelled'
            order.cancelled_at = new Date()
            await queryRunner.manager.save(Order, order)
            
            this.logger.log(`定时任务：订单 ${order.id} 已因超时自动取消`)
          } catch (error) {
            this.logger.error(`定时任务：处理过期订单失败 (ID: ${order.id}):`, error)
            // 继续处理其他订单
          }
        }
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      this.logger.error('定时任务：自动取消过期订单任务执行失败:', error)
      if (queryRunner) {
        await queryRunner.rollbackTransaction()
      }
    } finally {
      if (queryRunner) {
        await queryRunner.release()
      }
    }
  }
}