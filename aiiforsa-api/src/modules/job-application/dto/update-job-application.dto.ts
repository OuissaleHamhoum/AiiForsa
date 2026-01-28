import { PartialType } from '@nestjs/swagger';
import { CreateJobApplicationDto } from './create-job-application.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateJobApplicationDto extends PartialType(
  OmitType(CreateJobApplicationDto, ['userId'] as const),
) {}
