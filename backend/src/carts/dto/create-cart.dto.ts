import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ description: '用户ID', example: 1 })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: '商品ID', example: 1 })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: '数量', example: 1, required: false })
  @IsNumber()
  @Min(1, { message: '数量必须大于等于1' })
  quantity?: number;
}