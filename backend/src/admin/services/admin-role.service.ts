import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/admin-role.entity';

/**
 * 管理员角色服务
 * 负责管理员角色的查询等业务逻辑
 */
@Injectable()
export class AdminRoleService {
    constructor(
        @InjectRepository(AdminRole)
        private readonly adminRoleRepository: Repository<AdminRole>,
    ) { }

    /**
     * 获取所有启用的角色列表
     * @returns 角色列表
     */
    async findAll() {
        return await this.adminRoleRepository.find({
            where: { status: 1 }, // 只返回启用的角色
            order: { id: 'ASC' },
        });
    }

    /**
     * 根据ID查找角色
     * @param id 角色ID
     * @returns 角色信息
     */
    async findOne(id: number) {
        return await this.adminRoleRepository.findOne({
            where: { id },
        });
    }
}