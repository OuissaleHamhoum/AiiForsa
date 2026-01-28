import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdzunaService } from './adzuna.service';
import { JobController } from './job.controller';
import { JobDatabaseService } from './job-database.service';
import { JobService } from './job.service';

@Module({
  controllers: [JobController],
  providers: [JobService, AdzunaService, JobDatabaseService, PrismaService],
})
export class JobModule {}
