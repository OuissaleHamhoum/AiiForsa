import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsInt, IsOptional } from 'class-validator';

export class UpdateSectionDto {
  @ApiPropertyOptional({
    description: 'Section type',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Section title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Section content as JSON',
  })
  @IsObject()
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({
    description: 'Display order',
  })
  @IsInt()
  @IsOptional()
  order?: number;
}
