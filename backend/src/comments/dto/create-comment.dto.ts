import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '商品ID', example: 1 })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: '评论用户ID', example: 1 })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: '父评论ID（用于回复）', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @ApiProperty({ description: '评论内容', example: '这个商品看起来不错！' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString()
  content: string;
}

