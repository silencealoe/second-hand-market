import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUser } from './admin-user.entity';

/**
 * 管理员操作日志实体类
 * 用于记录后台管理系统的所有操作日志
 */
@Entity('admin_operation_logs')
export class AdminOperationLog {
  /**
   * 日志ID，主键自增
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '日志ID', example: 1 })
  id: number;

  /**
   * 操作管理员ID
   */
  @Column()
  @ApiProperty({ description: '操作管理员ID', example: 1 })
  adminUserId: number;

  /**
   * 操作模块名称
   */
  @Column({ length: 50 })
  @ApiProperty({ description: '操作模块', example: '用户管理' })
  module: string;

  /**
   * 操作动作
   */
  @Column({ length: 50 })
  @ApiProperty({ description: '操作动作', example: '新增用户' })
  action: string;

  /**
   * 操作目标ID，如用户ID、商品ID等
   */
  @Column({ nullable: true })
  @ApiProperty({ description: '操作目标ID', example: 123, required: false })
  targetId: number;

  /**
   * 操作描述
   */
  @Column({ length: 500, nullable: true })
  @ApiProperty({ description: '操作描述', example: '新增用户张三', required: false })
  description: string;

  /**
   * 操作IP地址
   */
  @Column({ length: 45 })
  @ApiProperty({ description: 'IP地址', example: '192.168.1.1' })
  ipAddress: string;

  /**
   * 用户代理信息
   */
  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: '用户代理', example: 'Mozilla/5.0...', required: false })
  userAgent: string;

  /**
   * 创建时间（操作时间）
   */
  @CreateDateColumn()
  @ApiProperty({ description: '操作时间', example: '2024-01-01 10:00:00' })
  createdAt: Date;

  /**
   * 关联的管理员用户
   */
  @ManyToOne(() => AdminUser, (user) => user.id)
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;
}