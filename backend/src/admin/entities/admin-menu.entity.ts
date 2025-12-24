import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 后台菜单实体类
 * 用于存储后台管理系统的菜单配置信息
 */
@Entity('admin_menus')
export class AdminMenu {
  /**
   * 菜单ID，主键自增
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '菜单ID', example: 1 })
  id: number;

  /**
   * 父菜单ID，0表示一级菜单
   */
  @Column({ default: 0 })
  @ApiProperty({ description: '父菜单ID，0表示一级菜单', example: 0 })
  parentId: number;

  /**
   * 菜单名称
   */
  @Column({ length: 50 })
  @ApiProperty({ description: '菜单名称', example: '用户管理' })
  name: string;

  /**
   * 菜单路径，前端路由路径
   */
  @Column({ length: 100, nullable: true })
  @ApiProperty({ description: '菜单路径', example: '/users', required: false })
  path: string;

  /**
   * 菜单图标，支持图标类名或图标URL
   */
  @Column({ length: 50, nullable: true })
  @ApiProperty({ description: '菜单图标', example: 'user', required: false })
  icon: string;

  /**
   * 排序号，数值越小排序越靠前
   */
  @Column({ default: 0 })
  @ApiProperty({ description: '排序号', example: 1 })
  sortOrder: number;

  /**
   * 是否显示：1显示 0隐藏
   */
  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: '是否显示：1显示 0隐藏', example: 1 })
  isVisible: number;

  /**
   * 权限标识，用于权限验证
   */
  @Column({ length: 100, nullable: true })
  @ApiProperty({ description: '权限标识', example: 'user:read', required: false })
  permissionKey: string;

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
}