import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { User } from './entities/user.entity';
import { Public } from '../common/decorators/public.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('users')
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: LoginResponseDto })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @Public()
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get()
  @ApiOperation({ summary: '获取商城用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认1' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量，默认10' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词（用户名、邮箱）' })
  @ApiResponse({ status: 200, description: '获取成功', type: [User] })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    // 安全地转换参数，避免NaN
    const pageNum = parseInt(page || '1', 10) || 1;
    const limitNum = parseInt(limit || '10', 10) || 10;

    const result = await this.usersService.findAll({
      page: pageNum,
      limit: limitNum,
      search: search?.trim(),
    });

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户信息' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.findOne(id);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '邮箱已被其他用户使用' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.usersService.update(id, updateUserDto);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get(':id/check-deletable')
  @ApiOperation({ summary: '检查用户是否可以删除' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({ status: 200, description: '检查成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async checkDeletable(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.checkUserDeletable(id);

    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiQuery({ name: 'force', required: false, description: '是否强制删除（删除关联数据）' })
  @ApiQuery({ name: 'deleteProducts', required: false, description: '是否删除用户的商品' })
  @ApiQuery({ name: 'deleteComments', required: false, description: '是否删除用户的评论' })
  @ApiQuery({ name: 'deleteCarts', required: false, description: '是否删除用户的购物车' })
  @ApiQuery({ name: 'deleteOrders', required: false, description: '是否删除用户的订单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '用户存在关联数据，无法删除' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: string,
    @Query('deleteProducts') deleteProducts?: string,
    @Query('deleteComments') deleteComments?: string,
    @Query('deleteCarts') deleteCarts?: string,
    @Query('deleteOrders') deleteOrders?: string,
  ) {
    const isForce = force === 'true';

    if (isForce) {
      // 强制删除，包括关联数据
      await this.usersService.forceRemove(id, {
        deleteProducts: deleteProducts === 'true',
        deleteComments: deleteComments === 'true',
        deleteCarts: deleteCarts === 'true',
        deleteOrders: deleteOrders === 'true',
      });
    } else {
      // 普通删除，如果有关联数据会抛出错误
      await this.usersService.remove(id);
    }

    return {
      code: 200,
      message: 'success',
      data: null
    };
  }
}

