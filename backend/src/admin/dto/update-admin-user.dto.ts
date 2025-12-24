import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsPhoneNumber, Length, IsInt, IsBoolean } from 'class-validator';
import { CreateAdminUserDto } from './create-admin-user.dto';

/**
 * 更新管理员用户数据传输对象
 * 用于接收更新管理员用户的请求参数，继承自CreateAdminUserDto但所有字段都是可选的
 */
export class UpdateAdminUserDto extends PartialType(CreateAdminUserDto) {
  /**
   * 用户状态：1启用 0禁用
   */
  @ApiProperty({ description: '状态：1启用 0禁用', example: 1, required: false })
  @IsInt({ message: '状态必须是整数' })
  @IsOptional()
  status?: number;

  /**
   * 真实姓名，可选，长度2-50字符
   */
  @ApiProperty({ description: '真实姓名', example: '李四', required: false })
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: '姓名长度必须在2-50个字符之间' })
  realName?: string;

  /**
   * 手机号码，可选，需要符合手机号格式
   */
  @ApiProperty({ description: '手机号', example: '13800138001', required: false })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  @IsOptional()
  phone?: string;

  /**
   * 角色ID，可选，必须是整数
   */
  @ApiProperty({ description: '角色ID', example: 2, required: false })
  @IsInt({ message: '角色ID必须是整数' })
  @IsOptional()
  roleId?: number;
}