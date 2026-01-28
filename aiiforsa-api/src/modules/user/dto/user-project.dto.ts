import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  IsArray,
} from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserProjectDto {
  @ApiProperty({
    example: 'E-commerce Platform',
    description: 'Project name',
  })
  @IsString()
  @Escape()
  name: string;

  @ApiPropertyOptional({
    example: 'A full-stack e-commerce solution...',
    description: 'Project description',
  })
  @IsOptional()
  @IsString()
  @Escape()
  description?: string;

  @ApiPropertyOptional({
    example: '2023-01-01',
    description: 'Project start date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2023-06-01',
    description: 'Project end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/user/project',
    description: 'Project repository URL',
  })
  @IsOptional()
  @IsUrl()
  repositoryUrl?: string;

  @ApiPropertyOptional({
    example: 'https://project-demo.com',
    description: 'Live demo URL',
  })
  @IsOptional()
  @IsUrl()
  liveUrl?: string;

  @ApiPropertyOptional({
    example: ['React', 'Node.js', 'MongoDB'],
    description: 'Technologies used in the project',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Escape({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({
    example: 'Led a team of 3 developers...',
    description: 'Your role and contributions',
  })
  @IsOptional()
  @IsString()
  @Escape()
  role?: string;

  @ApiPropertyOptional({
    example: 'Featured in TechCrunch...',
    description: 'Project highlights or achievements',
  })
  @IsOptional()
  @IsString()
  @Escape()
  highlights?: string;

  @ApiPropertyOptional({
    example: 'Personal',
    description: 'Project category or type',
  })
  @IsOptional()
  @IsString()
  @Escape()
  category?: string;
}

export class UpdateUserProjectDto extends CreateUserProjectDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Project ID for updates',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
