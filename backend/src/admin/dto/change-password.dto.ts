import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, NotEquals } from 'class-validator';

/**
 * 修改密码数据传输对象
 */
export class ChangePasswordDto {
  /**
   * 原密码
   */
  @ApiProperty({ description: '原密码', example: 'oldPassword123' })
  @IsNotEmpty({ message: '原密码不能为空' })
  @IsString({ message: '原密码必须是字符串' })
  @MinLength(6, { message: '原密码长度不能少于6个字符' })
  oldPassword: string;

  /**
   * 新密码
   */
  @ApiProperty({ description: '新密码', example: 'newPassword456' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @MaxLength(20, { message: '新密码长度不能超过20个字符' })
  @NotEquals('oldPassword', { message: '新密码不能与原密码相同' })
  newPassword: string;

  /**
   * 确认新密码
   */
  @ApiProperty({ description: '确认新密码', example: 'newPassword456' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword: string;
}