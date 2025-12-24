import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from './admin-role.entity';

/**
 * 管理员用户实体类
 * 用于存储后台管理系统的管理员账号信息
 */
@Entity('admin_users')
export class AdminUser {
  /**
   * 管理员ID，主键自增
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '管理员ID', example: 1 })
  id: number;

  /**
   * 管理员账号，唯一标识
   */
  @Column({ unique: true, length: 50 })
  @ApiProperty({ description: '管理员账号', example: 'admin' })
  username: string;

  /**
   * 加密后的密码，使用bcrypt加密
   */
  @Column({ length: 255 })
  @ApiProperty({ description: '加密密码', example: '$2b$10$hashedpassword' })
  password: string;

  /**
   * 真实姓名
   */
  @Column({ length: 50, nullable: true })
  @ApiProperty({ description: '真实姓名', example: '张三', required: false })
  realName: string;

  /**
   * 手机号码
   */
  @Column({ length: 20, nullable: true })
  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  phone: string;

  /**
   * 关联的角色ID
   */
  @Column({ name: 'role_id', nullable: true })
  @ApiProperty({ description: '角色ID', example: 1 })
  roleId: number;

  /**
   * 用户状态：1启用 0禁用
   */
  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: '状态：1启用 0禁用', example: 1 })
  status: number;

  /**
   * 最后登录时间
   */
  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: '最后登录时间', example: '2024-01-01 10:00:00', required: false })
  lastLoginAt: Date;

  /**
   * 创建时间
   */
  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2024-01-01 10:00:00' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间', example: '2024-01-01 10:00:00' })
  updatedAt: Date;

  /**
   * 关联的角色实体
   */
  @ManyToOne(() => AdminRole, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: AdminRole;
}