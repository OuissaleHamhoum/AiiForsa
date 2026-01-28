import { PartialType } from '@nestjs/mapped-types';
import { CreateJobRecommendationDto } from './create-job-recommendation.dto';

export class UpdateJobRecommendationDto extends PartialType(
  CreateJobRecommendationDto,
) {}
