import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * 管理员登录数据传输对象
 */
export class LoginDto {
  /**
   * 管理员账号
   */
  @ApiProperty({ description: '管理员账号', example: 'admin' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(20, { message: '用户名长度不能超过20个字符' })
  username: string;

  /**
   * 密码
   */
  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @MaxLength(20, { message: '密码长度不能超过20个字符' })
  password: string;
}