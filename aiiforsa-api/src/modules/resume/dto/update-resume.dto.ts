import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateResumeDto {
  @ApiPropertyOptional({
    description: 'Title of the resume',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Full resume data as JSON',
  })
  @IsObject()
  @IsOptional()
  data?: any;
}
