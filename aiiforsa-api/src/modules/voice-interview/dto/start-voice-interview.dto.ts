import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

/**
 * Job Description structure matching the Python interview_simulation format
 */
export class JobDescriptionDto {
  @ApiProperty({
    example: 'AI Engineer',
    description: 'Job title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'We are looking for an AI Engineer to join our team...',
    description: 'Job description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['Python', 'Machine Learning', 'PyTorch'],
    description: 'Required skills',
    required: false,
  })
  @IsOptional()
  requirements?: string[];

  @ApiProperty({
    example: ['Deep Learning', 'NLP', 'Computer Vision'],
    description: 'Preferred skills',
    required: false,
  })
  @IsOptional()
  preferredSkills?: string[];
}

/**
 * DTO for starting a voice interview session
 */
export class StartVoiceInterviewDto {
  @ApiProperty({
    description: 'Parsed CV data as JSON object',
    example: {
      personalInformation: { name: 'John Doe' },
      skills: ['Python', 'ML'],
    },
  })
  @IsObject()
  cvData: Record<string, any>;

  @ApiProperty({
    description: 'Job description details',
    type: JobDescriptionDto,
  })
  @ValidateNested()
  @Type(() => JobDescriptionDto)
  jobDescription: JobDescriptionDto;

  @ApiProperty({
    description: 'Optional session identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
