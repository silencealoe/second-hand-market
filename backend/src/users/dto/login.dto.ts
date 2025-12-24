import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱', example: 'john_doe' })
  @ValidateIf(o => !o.username)
  @IsNotEmpty({ message: '用户名或邮箱不能为空' })
  @IsString()
  usernameOrEmail?: string;

  @ApiProperty({ description: '用户名（兼容旧版客户端）', example: 'john_doe', required: false })
  @ValidateIf(o => !o.usernameOrEmail)
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username?: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;
}

