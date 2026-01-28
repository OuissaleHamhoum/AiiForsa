import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel, JobStatus, JobType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Escape } from 'class-sanitizer';

export class CreateJobDto {
  @ApiProperty({ example: 'Software Engineer', description: 'Job title' })
  @IsString()
  @Escape()
  title: string;

  @ApiProperty({
    example: 'Develop and maintain software applications.',
    description: 'Job description',
  })
  @IsString()
  @Escape()
  description: string;

  @ApiPropertyOptional({ example: 'New York, NY', description: 'Job location' })
  @IsOptional()
  @IsString()
  @Escape()
  location?: string;

  @ApiProperty({ example: 'Tech Corp', description: 'Company name' })
  @IsString()
  @Escape()
  companyName: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the job is remote',
  })
  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @ApiPropertyOptional({
    example: "Bachelor's degree in Computer Science or related field.",
    description: 'Job requirements',
  })
  @IsOptional()
  @IsString()
  @Escape()
  requirements?: string;

  @ApiPropertyOptional({
    example:
      'Develop software, collaborate with team, participate in code reviews.',
    description: 'Job responsibilities',
  })
  @IsOptional()
  @IsString()
  @Escape()
  responsibilities?: string;

  @ApiPropertyOptional({
    example: 'Health insurance, 401k, flexible hours.',
    description: 'Job benefits',
  })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Minimum salary' })
  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Maximum salary' })
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Salary currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: JobType.FULL_TIME, description: 'Job type' })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({
    example: ExperienceLevel.MID,
    description: 'Required experience level',
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({
    type: [String],
    example: ['React', 'Node.js', 'TypeScript'],
    description: 'Required skills',
  })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    type: Date,
    description: 'Job expiration date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Job posted date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  postedAt?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Job updated date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional({
    example: 'OPEN',
    description: 'Job status',
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
