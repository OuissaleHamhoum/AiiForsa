import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobDto } from './dto/createjob.dto';
import { UpdateJobDto } from './dto/updatejob.dto';
import { JobDatabaseService } from './job-database.service';

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobDatabaseService: JobDatabaseService,
  ) {}

  async create(data: CreateJobDto) {
    return this.prisma.job.create({ data: data as any });
  }

  //this is the Read
  async findAll() {
    return this.prisma.job.findMany();
  }

  async findOne(id: number) {
    return this.prisma.job.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateJobDto) {
    return this.prisma.job.update({ where: { id }, data: data as any });
  }

  async remove(id: number) {
    return this.prisma.job.delete({ where: { id } });
  }

  async syncJobsToDatabase() {
    const jobs = await this.prisma.job.findMany();
    const results: { id: number; success: boolean; message?: string; error?: string }[] = [];
    for (const job of jobs) {
      try {
        const jobData = {
          title: job.title,
          companyName: job.companyName,
          companyId: job.companyId,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          benefits: job.benefits,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          experienceLevel: job.experienceLevel,
          remote: job.remote,
          skills: job.skills,
          expiresAt: job.expiresAt?.toISOString(),
          slug: job.slug,
          externalUrl: job.externalUrl,
          source: job.source,
        };
        const result = await this.jobDatabaseService.addJob(jobData);
        results.push({ id: job.id, success: true, message: result });
      } catch (error: any) {
        results.push({ id: job.id, success: false, error: error.message });
      }
    }
    return results;
  }
}
