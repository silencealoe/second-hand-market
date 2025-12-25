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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
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
  ) {}

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
  @ApiOperation({ summary: '获取所有用户列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [User] })
  async findAll() {
    const result = await this.usersService.findAll();
    
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', type: 'number', description: '用户ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }
}

