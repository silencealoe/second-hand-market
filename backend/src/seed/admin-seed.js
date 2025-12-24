const { createConnection } = require('typeorm');
const { AdminUser } = require('../admin/entities/admin-user.entity');
const { AdminRole } = require('../admin/entities/admin-role.entity');
const { DataSource } = require('typeorm');

// 创建临时数据源配置
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'second_hand_market',
  entities: [
    './src/admin/entities/*.entity.ts',
  ],
  synchronize: true,
  logging: false,
});
const bcrypt = require('bcrypt');

// 创建数据库连接并初始化管理员账号
async function initializeAdmin() {
  try {
    // 创建数据库连接
    const connection = await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'second_hand_market',
      entities: [
        '../admin/entities/admin-user.entity.js',
        '../admin/entities/admin-role.entity.js'
      ],
      synchronize: true,
    });

    console.log('✅ 数据库连接成功');

    const adminRoleRepository = connection.getRepository(AdminRole);
    const adminUserRepository = connection.getRepository(AdminUser);

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

    // 关闭数据库连接
    await connection.close();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 初始化管理员账号失败:', error.message);
    process.exit(1);
  }
}

// 执行初始化
try {
  initializeAdmin();
} catch (error) {
  console.error('❌ 执行初始化脚本失败:', error.message);
  process.exit(1);
}
