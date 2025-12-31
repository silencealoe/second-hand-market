import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRoleService } from '../services/admin-role.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

/**
 * 后台管理角色控制器
 * 处理管理员角色的查询操作
 */
@ApiTags('后台管理-角色管理')
@Controller('admin/roles')
export class AdminRoleController {
    constructor(private readonly adminRoleService: AdminRoleService) { }

    /**
     * 获取所有角色列表
     * @returns 角色列表
     */
    @Get()
    // @UseGuards(JwtAuthGuard)
    // @ApiBearerAuth()
    @ApiOperation({ summary: '获取角色列表', description: '获取所有可用的管理员角色' })
    @ApiResponse({ status: 200, description: '获取成功' })
    @ApiResponse({ status: 401, description: '未授权' })
    @Public()
    async findAll() {
        const result = await this.adminRoleService.findAll();

        return {
            code: 200,
            message: 'success',
            data: result
        };
    }
}