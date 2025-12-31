import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsPhoneNumber, Length, IsInt } from 'class-validator';

/**
 * 创建管理员用户数据传输对象
 * 用于接收创建管理员用户的请求参数
 */
export class CreateAdminUserDto {
  /**
   * 管理员账号，必填，长度2-50字符
   */
  @ApiProperty({ description: '管理员账号', example: 'admin', required: true })
  @IsString()
  @IsNotEmpty({ message: '账号不能为空' })
  @Length(2, 50, { message: '账号长度必须在2-50个字符之间' })
  username: string;

  /**
   * 密码，必填，长度6-20字符
   */
  @ApiProperty({ description: '密码', example: 'password123', required: true })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 20, { message: '密码长度必须在6-20个字符之间' })
  password: string;

  /**
   * 真实姓名，可选，长度2-50字符
   */
  @ApiProperty({ description: '真实姓名', example: '张三', required: false })
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: '姓名长度必须在2-50个字符之间' })
  realName?: string;

  /**
   * 手机号码，可选，需要符合手机号格式
   */
  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  @IsOptional()
  phone?: string;

  /**
   * 角色ID，必填，必须是整数
   */
  @ApiProperty({ description: '角色ID', example: 1, required: true })
  @IsInt({ message: '角色ID必须是整数' })
  @IsNotEmpty({ message: '角色ID不能为空' })
  roleId: number;

  /**
   * 状态 非必填 默认1
   * @example 1
   *
   */
  @ApiProperty({ description: '状态', example: 1, required: false })
  @IsOptional()
  status?: number;
}