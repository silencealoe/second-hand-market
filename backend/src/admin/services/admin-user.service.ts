import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminRole } from '../entities/admin-role.entity';
import { AdminOperationLog } from '../entities/admin-operation-log.entity';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';

/**
 * 管理员用户服务
 * 负责管理员用户的增删改查、状态管理、权限验证等业务逻辑
 */
@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminRole)
    private readonly adminRoleRepository: Repository<AdminRole>,
    @InjectRepository(AdminOperationLog)
    private readonly operationLogRepository: Repository<AdminOperationLog>,
  ) {}

  /**
   * 创建管理员用户
   * @param createAdminUserDto 创建用户数据传输对象
   * @param currentUserId 当前操作的管理员ID
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @returns 创建的用户信息
   */
  async create(
    createAdminUserDto: CreateAdminUserDto,
    currentUserId: number,
    ipAddress: string,
    userAgent: string
  ) {
    // 检查用户名是否已存在
    const existingUser = await this.adminUserRepository.findOne({
      where: { username: createAdminUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查角色是否存在
    const role = await this.adminRoleRepository.findOneBy({ 
      id: createAdminUserDto.roleId 
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);

    // 创建用户
    const user = this.adminUserRepository.create({
      ...createAdminUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.adminUserRepository.save(user);

    // 记录操作日志
    await this.recordOperationLog(
      currentUserId,
      '用户管理',
      '新增用户',
      savedUser.id,
      `新增管理员用户：${createAdminUserDto.username}`,
      ipAddress,
      userAgent
    );

    // 查询完整的用户信息，包含角色关联
    return this.findOne(savedUser.id);
  }

  /**
   * 根据ID查找管理员用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findOne(id: number) {
    const user = await this.adminUserRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 更新管理员用户信息
   * @param id 用户ID
   * @param updateAdminUserDto 更新用户数据传输对象
   * @param currentUserId 当前操作的管理员ID
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @returns 更新后的用户信息
   */
  async update(
    id: number,
    updateAdminUserDto: UpdateAdminUserDto,
    currentUserId: number,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await this.findOne(id);

    // 检查用户名是否重复（排除当前用户）
    if (updateAdminUserDto.username && updateAdminUserDto.username !== user.username) {
      const existingUser = await this.adminUserRepository.findOne({
        where: { username: updateAdminUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 检查角色是否存在
    if (updateAdminUserDto.roleId) {
      const role = await this.adminRoleRepository.findOneBy({ 
        id: updateAdminUserDto.roleId 
      });
      if (!role) {
        throw new NotFoundException('角色不存在');
      }
    }

    // 更新用户信息
    Object.assign(user, updateAdminUserDto);
    const updatedUser = await this.adminUserRepository.save(user);

    // 记录操作日志
    await this.recordOperationLog(
      currentUserId,
      '用户管理',
      '编辑用户',
      id,
      `编辑管理员用户：${user.username}`,
      ipAddress,
      userAgent
    );

    return updatedUser;
  }

  /**
   * 删除管理员用户
   * @param id 用户ID
   * @param currentUserId 当前操作的管理员ID
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   */
  async remove(
    id: number,
    currentUserId: number,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await this.findOne(id);

    // 不能删除自己
    if (id === currentUserId) {
      throw new ForbiddenException('不能删除自己的账号');
    }

    await this.adminUserRepository.remove(user);

    // 记录操作日志
    await this.recordOperationLog(
      currentUserId,
      '用户管理',
      '删除用户',
      id,
      `删除管理员用户：${user.username}`,
      ipAddress,
      userAgent
    );
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param currentUserId 当前操作的管理员ID
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   */
  async resetPassword(
    id: number,
    currentUserId: number,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await this.findOne(id);

    // 加密新密码（默认密码为123456）
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    user.password = hashedPassword;

    await this.adminUserRepository.save(user);

    // 记录操作日志
    await this.recordOperationLog(
      currentUserId,
      '用户管理',
      '重置密码',
      id,
      `重置用户 ${user.username} 的密码为默认密码`,
      ipAddress,
      userAgent
    );

    return { message: '密码重置成功' };
  }

  /**
   * 启用/禁用用户
   * @param id 用户ID
   * @param status 状态：0-禁用，1-启用
   * @param currentUserId 当前操作的管理员ID
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   */
  async toggleStatus(
    id: number,
    status: number,
    currentUserId: number,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await this.findOne(id);

    // 不能禁用自己
    if (id === currentUserId && status === 0) {
      throw new ForbiddenException('不能禁用自己的账号');
    }

    user.status = status;
    await this.adminUserRepository.save(user);

    // 记录操作日志
    const action = status === 1 ? '启用用户' : '禁用用户';
    await this.recordOperationLog(
      currentUserId,
      '用户管理',
      action,
      id,
      `${action}：${user.username}`,
      ipAddress,
      userAgent
    );

    return { message: `${action}成功` };
  }

  /**
   * 分页查询管理员用户列表（支持更多参数）
   * @param options 查询选项
   * @returns 用户列表和分页信息
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: number;
  }) {
    const { page = 1, limit = 10, search, roleId, status } = options;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<AdminUser> = {};

    // 关键词搜索
    if (search) {
      where.username = Like(`%${search}%`);
    }

    // 角色筛选
    if (roleId) {
      where.roleId = roleId;
    }

    // 状态筛选
    if (status !== undefined) {
      where.status = status;
    }

    const [users, total] = await this.adminUserRepository.findAndCount({
      where,
      relations: ['role'],
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 记录操作日志
   * @param adminUserId 管理员用户ID
   * @param module 操作模块
   * @param action 操作动作
   * @param targetId 目标ID
   * @param description 操作描述
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   */
  private async recordOperationLog(
    adminUserId: number,
    module: string,
    action: string,
    targetId: number,
    description: string,
    ipAddress: string,
    userAgent: string
  ) {
    const log = this.operationLogRepository.create({
      adminUserId,
      module,
      action,
      targetId,
      description,
      ipAddress,
      userAgent,
    });
    await this.operationLogRepository.save(log);
  }
}