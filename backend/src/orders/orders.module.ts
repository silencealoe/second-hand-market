import { Module } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './entities/order.entity'
import { Product } from '../products/entities/product.entity'
import { Cart } from '../carts/entities/cart.entity'
import { AlipayService } from './alipay.service'

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Cart])],
  controllers: [OrdersController],
  providers: [OrdersService, AlipayService],
})
export class OrdersModule {}