import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP',
}

export class CreateUserWorkExperienceDto {
  @ApiProperty({
    example: 'Senior Software Developer',
    description: 'Job title/position',
  })
  @IsString()
  @Escape()
  position: string;

  @ApiProperty({
    example: 'Tech Corp Inc.',
    description: 'Company name',
  })
  @IsString()
  @Escape()
  company: string;

  @ApiPropertyOptional({
    example: 'San Francisco, CA',
    description: 'Company location',
  })
  @IsOptional()
  @IsString()
  @Escape()
  location?: string;

  @ApiProperty({
    example: '2020-01-01',
    description: 'Start date',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2023-12-31',
    description: 'End date (null if current position)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the current position',
  })
  @IsOptional()
  @IsBoolean()
  isCurrentPosition?: boolean;

  @ApiPropertyOptional({
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
    description: 'Type of employment',
  })
  @IsOptional()
  @IsString()
  @Escape()
  employmentType?: string;

  @ApiPropertyOptional({
    example: 'Led development of scalable web applications...',
    description: 'Job description and responsibilities',
  })
  @IsOptional()
  @IsString()
  @Escape()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://company.com',
    description: 'Company website URL',
  })
  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Industry sector',
  })
  @IsOptional()
  @IsString()
  @Escape()
  industry?: string;
}

export class UpdateUserWorkExperienceDto extends CreateUserWorkExperienceDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Work experience ID for updates',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
