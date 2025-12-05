import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: '评论内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}

