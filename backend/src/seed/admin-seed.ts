import { Connection } from 'typeorm';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { AdminRole } from '../admin/entities/admin-role.entity';
import * as bcrypt from 'bcrypt';

/**
 * 管理员账号种子数据
 * 用于创建初始的超级管理员账号
 */
export const seedAdminAccount = async (connection: Connection) => {
  const adminRoleRepository = connection.getRepository(AdminRole);
  const adminUserRepository = connection.getRepository(AdminUser);

  try {
    // 检查是否已存在超级管理员角色
    let adminRole = await adminRoleRepository.findOne({
      where: { isSuper: 1 },
    });

    // 如果不存在，创建超级管理员角色
    if (!adminRole) {
      adminRole = adminRoleRepository.create({
        name: '超级管理员',
        description: '拥有所有权限的超级管理员角色',
        permissions: {},
        isSuper: 1,
        status: 1,
      });
      adminRole = await adminRoleRepository.save(adminRole);
      console.log('✅ 已创建超级管理员角色');
    }

    // 检查是否已存在管理员账号
    const existingAdmin = await adminUserRepository.findOne({
      where: { username: 'admin' },
    });

    // 如果不存在，创建管理员账号
    if (!existingAdmin) {
      // 生成加密密码
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = adminUserRepository.create({
        username: 'admin',
        password: hashedPassword,
        realName: '超级管理员',
        phone: '13800138000',
        roleId: adminRole.id,
        status: 1,
      });

      await adminUserRepository.save(adminUser);
      console.log('✅ 已创建初始管理员账号');
      console.log('🔑 账号: admin');
      console.log('🔑 密码: admin123');
    } else {
      console.log('⚠️  管理员账号已存在');
    }
  } catch (error) {
    console.error('❌ 创建初始管理员账号失败:', error);
    throw error;
  }
};
