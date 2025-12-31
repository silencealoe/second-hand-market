import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { AdminUserService } from '../services/admin-user.service';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PageQueryParams } from '../types/page-query-params.interface';



/**
 * 后台管理用户控制器
 * 处理管理员用户的增删改查操作
 */
@ApiTags('后台管理-用户管理')
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) { }

  /**
   * 创建管理员用户
   * @param createAdminUserDto 创建用户数据传输对象
   * @param req 请求对象
   * @returns 创建的用户信息
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建管理员用户', description: '创建新的管理员用户账号' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async create(
    @Body() createAdminUserDto: CreateAdminUserDto,
    @Req() req: any
  ) {
    const currentUserId = req.user.sub;
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'];

    const result = await this.adminUserService.create(
      createAdminUserDto,
      currentUserId,
      ipAddress,
      userAgent
    );

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 获取管理员用户列表
   * @param page 页码（可选，默认1）
   * @param limit 每页数量（可选，默认10）
   * @param search 搜索关键词（可选）
   * @param roleId 角色ID筛选（可选）
   * @param status 状态筛选（可选）
   * @returns 用户列表和分页信息
   */
  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户列表', description: '获取管理员用户列表，支持分页和搜索' })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认1' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量，默认10' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词（用户名、真实姓名）' })
  @ApiQuery({ name: 'roleId', required: false, description: '角色ID筛选' })
  @ApiQuery({ name: 'status', required: false, description: '状态筛选：0-禁用，1-启用' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @Public()
  async findAll(
    @Query() pageQueryParams: PageQueryParams,
    @Query('roleId') roleId?: string,
    @Query('status') status?: string
  ) {
    // 安全地转换参数，避免NaN
    const page = parseInt(pageQueryParams.page?.toString() || '1', 10) || 1;
    const limit = parseInt(pageQueryParams.limit?.toString() || '10', 10) || 10;
    const parsedRoleId = roleId ? parseInt(roleId, 10) : undefined;
    const parsedStatus = status ? parseInt(status, 10) : undefined;

    const result = await this.adminUserService.findAll({
      page,
      limit,
      search: pageQueryParams.search,
      roleId: isNaN(parsedRoleId) ? undefined : parsedRoleId,
      status: isNaN(parsedStatus) ? undefined : parsedStatus,
    });

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 根据ID获取管理员用户详情
   * @param id 用户ID
   * @returns 用户详情信息
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户详情', description: '根据ID获取管理员用户的详细信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string) {
    const result = await this.adminUserService.findOne(+id);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 更新管理员用户信息
   * @param id 用户ID
   * @param updateAdminUserDto 更新用户数据传输对象
   * @param req 请求对象
   * @returns 更新后的用户信息
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户信息', description: '更新管理员用户的基本信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @Req() req: any
  ) {
    const currentUserId = req.user.sub;
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'];

    const result = await this.adminUserService.update(
      +id,
      updateAdminUserDto,
      currentUserId,
      ipAddress,
      userAgent
    );

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 删除管理员用户
   * @param id 用户ID
   * @param req 请求对象
   * @returns 删除结果
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户', description: '删除指定的管理员用户账号' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 400, description: '不能删除自己' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user.sub;
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'];

    const result = await this.adminUserService.remove(
      +id,
      currentUserId,
      ipAddress,
      userAgent
    );

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param req 请求对象
   * @returns 重置结果
   */
  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '重置密码', description: '重置指定用户的密码为默认密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async resetPassword(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user.sub;
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'];

    const result = await this.adminUserService.resetPassword(
      +id,
      currentUserId,
      ipAddress,
      userAgent
    );

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 启用/禁用用户
   * @param id 用户ID
   * @param status 状态：0-禁用，1-启用
   * @param req 请求对象
   * @returns 操作结果
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '启用/禁用用户', description: '启用或禁用指定的管理员用户账号' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiQuery({ name: 'status', required: true, description: '状态：0-禁用，1-启用' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 400, description: '不能禁用自己' })
  async toggleStatus(
    @Param('id') id: string,
    @Query('status') status: number,
    @Req() req: any
  ) {
    const currentUserId = req.user.sub;
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'];

    const result = await this.adminUserService.toggleStatus(
      +id,
      status,
      currentUserId,
      ipAddress,
      userAgent
    );

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }
}