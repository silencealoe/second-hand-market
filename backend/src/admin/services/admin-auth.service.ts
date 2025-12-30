import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminOperationLog } from '../entities/admin-operation-log.entity';

/**
 * 后台管理认证服务
 * 负责管理员用户的登录、登出、密码验证等认证相关功能
 */
@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminOperationLog)
    private readonly operationLogRepository: Repository<AdminOperationLog>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 管理员用户登录
   * @param username 管理员账号
   * @param password 密码
   * @param ipAddress 登录IP地址
   * @param userAgent 用户代理信息
   * @returns 登录结果，包含JWT令牌和用户信息
   */
  async login(
    username: string, 
    password: string, 
    ipAddress: string, 
    userAgent: string
  ) {
    // 查找用户
    const user = await this.adminUserRepository.findOne({
      where: { username },
      relations: ['role'],
    });
    
    console.log('初始查询用户信息:', user);
    console.log('初始查询用户角色信息:', user?.role);

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 检查用户状态
    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.adminUserRepository.save(user);

    // 重新查询用户信息，确保包含角色关联
    const updatedUser = await this.adminUserRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    // 生成JWT令牌
    const payload = { 
      sub: updatedUser.id, 
      username: updatedUser.username, 
      role: updatedUser.role?.name || '',
      isSuper: updatedUser.role?.isSuper || 0 
    };
    const token = this.jwtService.sign(payload);

    // 记录登录日志
    await this.recordOperationLog(
      user.id,
      '认证',
      '登录',
      null,
      `管理员 ${user.username} 登录系统`,
      ipAddress,
      userAgent
    );

    return {
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        realName: updatedUser.realName,
        avatar: updatedUser.avatar,
        role: updatedUser.role?.name || '',
        isSuper: updatedUser.role?.isSuper || 0,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    };
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 令牌载荷
   */
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('令牌无效或已过期');
    }
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await this.adminUserRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('旧密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.adminUserRepository.save(user);

    // 记录操作日志
    await this.recordOperationLog(
      userId,
      '认证',
      '修改密码',
      null,
      '修改登录密码',
      ipAddress,
      userAgent
    );
  }

  /**
   * 获取管理员用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  async getProfile(userId: number) {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
      relations: ['role'],
      select: ['id', 'username', 'realName', 'phone', 'avatar', 'status', 'lastLoginAt', 'createdAt']
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
      role: user.role?.name || '',
      isSuper: user.role?.isSuper || 0,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
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
    targetId: number | null,
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