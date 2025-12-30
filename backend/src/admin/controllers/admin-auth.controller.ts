import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from '../services/admin-auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

/**
 * 后台管理认证控制器
 * 处理管理员登录、登出、密码修改等认证相关操作
 */
@ApiTags('后台管理-认证')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) { }

  /**
   * 管理员登录接口
   * @param loginDto 登录数据传输对象
   * @param req 请求对象
   * @returns 登录结果，包含JWT令牌和用户信息
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录', description: '管理员用户登录系统' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '账号或密码错误' })
  @Public()
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any
  ) {
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'];

    const result = await this.adminAuthService.login(
      loginDto.username,
      loginDto.password,
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
   * 获取当前登录管理员信息
   * @param req 请求对象
   * @returns 当前登录管理员信息
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员信息', description: '获取当前登录管理员的基本信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @Public()
  async getProfile(@Req() req: any) {
    const userId = req.user.sub;
    const result = await this.adminAuthService.getProfile(userId);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  /**
   * 修改密码
   * @param changePasswordDto 密码修改数据传输对象
   * @param req 请求对象
   * @returns 修改结果
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码', description: '修改当前登录管理员的密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 400, description: '原密码错误' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any
  ) {
    const userId = req.user.sub;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.adminAuthService.changePassword(
      userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
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
   * 验证令牌有效性
   * @param req 请求对象
   * @returns 验证结果
   */
  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证令牌', description: '验证JWT令牌是否有效' })
  @ApiResponse({ status: 200, description: '令牌有效' })
  @ApiResponse({ status: 401, description: '令牌无效' })
  async validateToken(@Req() req: any) {
    return {
      code: 200,
      message: 'success',
      data: {
        valid: true,
        user: req.user,
      }
    };
  }

  /**
   * 管理员退出登录
   * @param req 请求对象
   * @returns 退出登录结果
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员退出登录', description: '管理员用户退出登录系统' })
  @ApiResponse({ status: 200, description: '退出登录成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async logout(@Req() req: any) {
    const userId = req.user.sub;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await this.adminAuthService.logout(userId, ipAddress, userAgent);

    return {
      code: 200,
      message: 'success',
      data: {
        message: '退出登录成功'
      }
    };
  }
}