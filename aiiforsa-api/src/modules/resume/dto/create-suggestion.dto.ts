import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateSuggestionDto {
  @ApiPropertyOptional({
    description: 'Section ID (if suggestion is for a specific section)',
  })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiProperty({
    description: 'Suggestion type',
    example: 'rewrite',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Original content',
  })
  @IsObject()
  original: any;

  @ApiProperty({
    description: 'Suggested content',
  })
  @IsObject()
  suggested: any;

  @ApiPropertyOptional({
    description: 'Reason for suggestion',
    example: 'Improved clarity and impact',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
