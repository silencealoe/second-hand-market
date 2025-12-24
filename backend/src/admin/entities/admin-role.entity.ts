import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUser } from './admin-user.entity';

/**
 * 管理员角色实体类
 * 用于存储后台管理系统的角色信息及权限配置
 */
@Entity('admin_roles')
export class AdminRole {
  /**
   * 角色ID，主键自增
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '角色ID', example: 1 })
  id: number;

  /**
   * 角色名称
   */
  @Column({ length: 50 })
  @ApiProperty({ description: '角色名称', example: '超级管理员' })
  name: string;

  /**
   * 角色描述
   */
  @Column({ length: 200, nullable: true })
  @ApiProperty({ description: '角色描述', example: '拥有所有权限', required: false })
  description: string;

  /**
   * 权限配置，JSON格式存储菜单权限
   */
  @Column({ type: 'json', nullable: true })
  @ApiProperty({ 
    description: '权限配置', 
    example: { 'user:read': true, 'user:write': true },
    required: false 
  })
  permissions: Record<string, boolean>;

  /**
   * 是否为超级管理员：1是 0否
   */
  @Column({ type: 'tinyint', default: 0 })
  @ApiProperty({ description: '是否超级管理员：1是 0否', example: 0 })
  isSuper: number;

  /**
   * 角色状态：1启用 0禁用
   */
  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: '状态：1启用 0禁用', example: 1 })
  status: number;

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
   * 关联的用户列表
   */
  @OneToMany(() => AdminUser, (user) => user.role)
  users: AdminUser[];
}