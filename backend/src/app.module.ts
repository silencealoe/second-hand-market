import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CommentsModule } from './comments/comments.module';
import { UploadModule } from './upload/upload.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Comment } from './comments/entities/comment.entity';
import { Cart } from './carts/entities/cart.entity';
import { Order } from './orders/entities/order.entity';
import { AdminUser } from './admin/entities/admin-user.entity';
import { AdminRole } from './admin/entities/admin-role.entity';
import { AdminMenu } from './admin/entities/admin-menu.entity';
import { AdminOperationLog } from './admin/entities/admin-operation-log.entity';
import { Announcement } from './admin/entities/announcement.entity';
import { Coupon } from './admin/entities/coupon.entity';
import { EnhancedJwtAuthGuard } from './common/guards/enhanced-jwt-auth.guard';

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
      // password: 'root12345',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'second_hand_market',
      entities: [
        User, Product, Comment, Cart, Order,
        AdminUser, AdminRole, AdminMenu, AdminOperationLog, Announcement, Coupon
      ],
      synchronize: true, // 开发环境设为 true 自动创建表
      logging: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ProductsModule,
    CommentsModule,
    UploadModule,
    CartsModule,
    OrdersModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD, // APP_GUARD内置特殊令牌 用于注册全局守卫
      useClass: EnhancedJwtAuthGuard, // useClass 指定使用的守卫类 JWT认证守卫  应用于所有控制器和路由处理程序
    },
    Reflector, // Reflector 用于在守卫中获取元数据
  ],
})
export class AppModule {}

