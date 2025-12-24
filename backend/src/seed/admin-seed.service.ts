import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { AdminRole } from '../admin/entities/admin-role.entity';

/**
 * 管理员用户种子服务
 * 用于在应用启动时创建默认管理员用户和角色
 */
@Injectable()
export class AdminSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser) 
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminRole) 
    private readonly adminRoleRepository: Repository<AdminRole>,
  ) {}

  /**
   * 模块初始化时执行
   */
  async onModuleInit() {
    try {
      // 先删除所有用户数据，确保重新创建时不会有NULL值的role_id字段
      await this.adminUserRepository.createQueryBuilder().delete().execute();
      
      // 确保角色和用户都被重新创建
      await this.seedAdminRole();
      await this.seedAdminUser();
    } catch (error) {
      console.error('执行种子数据创建失败:', error);
    }
  }

  /**
   * 创建默认管理员角色
   */
  private async seedAdminRole() {
    // 定义需要创建的角色
    const roles = [
      {
        name: '超级管理员',
        description: '系统超级管理员，拥有所有权限',
        isSuper: 1,
      },
      {
        name: '普通管理员',
        description: '普通管理员，拥有基本管理权限',
        isSuper: 0,
      },
    ];

    // 批量创建角色
    for (const roleConfig of roles) {
      // 检查角色是否已存在
      const existingRole = await this.adminRoleRepository.findOne({
        where: { name: roleConfig.name },
      });

      if (!existingRole) {
        // 创建角色
        await this.adminRoleRepository.save({
          ...roleConfig,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`已创建默认角色：${roleConfig.name}`);
      }
    }
  }

  /**
   * 创建默认管理员用户
   */
  private async seedAdminUser() {
    // 检查是否已存在管理员用户
    const adminUser = await this.adminUserRepository.findOne({
      where: { username: 'admin' },
      relations: ['role'],
    });

    if (!adminUser) {
      // 获取超级管理员角色
      const superAdminRole = await this.adminRoleRepository.findOne({
        where: { isSuper: 1 },
      });

      console.log('获取到的超级管理员角色：', superAdminRole);

      if (superAdminRole) {
        // 加密默认密码
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // 创建管理员用户
        const newUser = await this.adminUserRepository.save({
          username: 'admin',
          password: hashedPassword,
          realName: '系统管理员',
          phone: '13800138000',
          roleId: superAdminRole.id,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log('已创建默认管理员用户：', newUser);

        // 验证用户角色关联
        const savedUser = await this.adminUserRepository.findOne({
          where: { id: newUser.id },
          relations: ['role'],
        });

        console.log('验证用户角色关联：', savedUser?.role);
      } else {
        console.error('无法创建管理员用户：未找到超级管理员角色');
      }
    } else {
      console.log('管理员用户已存在：', adminUser);
      console.log('管理员用户角色：', adminUser.role);
    }
  }
}
