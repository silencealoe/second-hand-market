import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 实体导入
import { AdminUser } from './entities/admin-user.entity';
import { AdminRole } from './entities/admin-role.entity';
import { AdminMenu } from './entities/admin-menu.entity';
import { AdminOperationLog } from './entities/admin-operation-log.entity';
import { Announcement } from './entities/announcement.entity';
import { Coupon } from './entities/coupon.entity';

// 服务导入
import { AdminAuthService } from './services/admin-auth.service';
import { AdminUserService } from './services/admin-user.service';
import { DashboardService } from './services/dashboard.service';
import { AdminSeedService } from '../seed/admin-seed.service';

// 控制器导入
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { DashboardController } from './controllers/dashboard.controller';

// 其他实体导入（用于DashboardService）
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';

/**
 * 后台管理模块
 * 负责后台管理系统的所有功能，包括认证、用户管理、数据大屏等
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 后台管理实体
      AdminUser,
      AdminRole,
      AdminMenu,
      AdminOperationLog,
      Announcement,
      Coupon,
      // 前台业务实体（用于Dashboard统计）
      User,
      Product,
      Order,
    ]),

  ],
  controllers: [
    AdminAuthController,
    AdminUserController,
    DashboardController,
  ],
  providers: [
    AdminAuthService,
    AdminUserService,
    DashboardService,
    AdminSeedService,
  ],
  exports: [
    AdminAuthService,
    AdminUserService,
    DashboardService,
  ],
})
export class AdminModule {}