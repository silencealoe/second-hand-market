import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CommentsModule } from './comments/comments.module';
import { UploadModule } from './upload/upload.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Comment } from './comments/entities/comment.entity';
import { Cart } from './carts/entities/cart.entity';
import { Order } from './orders/entities/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: 'root12345',
      database: process.env.DB_DATABASE || 'second_hand_market',
      entities: [User, Product, Comment, Cart, Order],
      synchronize: true, // 开发环境设为 true 自动创建表
      logging: true,
    }),
    UsersModule,
    ProductsModule,
    CommentsModule,
    UploadModule,
    CartsModule,
    OrdersModule,
  ],
})
export class AppModule {}

