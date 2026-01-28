import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './createjob.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {}
