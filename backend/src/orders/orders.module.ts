import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { Order } from './entities/order.entity'
import { Product } from '../products/entities/product.entity'
import { Cart } from '../carts/entities/cart.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Cart])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}