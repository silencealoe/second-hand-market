import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ description: '数量', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '数量必须大于等于1' })
  quantity?: number;

  @ApiProperty({ description: '是否选中', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}