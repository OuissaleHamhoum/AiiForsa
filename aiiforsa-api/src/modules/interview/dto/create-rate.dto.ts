import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRateDto {
  @ApiProperty({
    example: 80,
    description: 'Rating value (0-100)',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'user-id',
    description: 'Author user id',
    required: false,
  })
  authorId?: string;
}
