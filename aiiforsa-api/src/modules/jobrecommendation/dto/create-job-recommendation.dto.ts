import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { RecommendationStatus } from '@prisma/client';

export class CreateJobRecommendationDto {
  @IsString()
  userId: string;

  @IsString()
  jobId: string;

  @IsInt()
  matchScore: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RecommendationStatus)
  status?: RecommendationStatus;

  @IsOptional()
  @IsDateString()
  generatedAt?: Date;
}
