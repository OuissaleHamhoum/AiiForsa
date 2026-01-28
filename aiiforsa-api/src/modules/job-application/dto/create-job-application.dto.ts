import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel, JobType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateJobApplicationDto {
  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  jobId?: number;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  cvId?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  coverLetterId?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  jobType?: JobType;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  experienceLevel?: ExperienceLevel;
}
