import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional } from 'class-validator';

export class MatchJobDto {
  @ApiProperty({ description: 'Resume data as JSON object' })
  @IsObject()
  resumeData: any;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: 'Job requirements' })
  @IsString()
  jobRequirements: string;

  @ApiPropertyOptional({ description: 'Job description' })
  @IsString()
  @IsOptional()
  jobDescription?: string;

  @ApiPropertyOptional({ description: 'GitHub URL' })
  @IsString()
  @IsOptional()
  githubUrl?: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL' })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;
}
