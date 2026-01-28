/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { XpService } from '../xp/xp.service';

@Injectable()
export class JobApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
  ) {}

  async create(createJobApplicationDto: CreateJobApplicationDto) {
    // If jobId is provided, fetch job details to populate missing fields
    if (createJobApplicationDto.jobId) {
      const job = await this.prisma.job.findUnique({
        where: { id: createJobApplicationDto.jobId },
      });
      if (job) {
        createJobApplicationDto.jobTitle =
          createJobApplicationDto.jobTitle || job.title;
        createJobApplicationDto.companyName =
          createJobApplicationDto.companyName || job.companyName;
        if (
          job.salaryMin !== null &&
          createJobApplicationDto.salaryMin === undefined
        ) {
          createJobApplicationDto.salaryMin = job.salaryMin;
        }
        if (
          job.salaryMax !== null &&
          createJobApplicationDto.salaryMax === undefined
        ) {
          createJobApplicationDto.salaryMax = job.salaryMax;
        }
        createJobApplicationDto.salaryCurrency =
          createJobApplicationDto.salaryCurrency || job.currency || undefined;
        createJobApplicationDto.jobType =
          createJobApplicationDto.jobType || job.type || undefined;
        createJobApplicationDto.experienceLevel =
          createJobApplicationDto.experienceLevel ||
          job.experienceLevel ||
          undefined;
      }
    }

    // Validate required fields
    if (
      !createJobApplicationDto.jobTitle ||
      !createJobApplicationDto.companyName
    ) {
      throw new Error('Job title and company name are required');
    }

    // Ensure userId is present (controller should set it from authenticated user)
    const payload: any = {
      userId: createJobApplicationDto.userId!,
      jobId: createJobApplicationDto.jobId,
      jobTitle: createJobApplicationDto.jobTitle!,
      companyName: createJobApplicationDto.companyName!,
      appliedAt: createJobApplicationDto.appliedAt
        ? new Date(createJobApplicationDto.appliedAt)
        : undefined,
      // Prisma schema expects a single `salary` field; map salaryMax -> salary, or salaryMin if only that exists
      salary:
        createJobApplicationDto.salaryMax ??
        createJobApplicationDto.salaryMin ??
        undefined,
      salaryCurrency: createJobApplicationDto.salaryCurrency,
      jobType: createJobApplicationDto.jobType,
      experienceLevel: createJobApplicationDto.experienceLevel,
      cvId: createJobApplicationDto.cvId,
      coverLetterId: createJobApplicationDto.coverLetterId,
      isExternal: createJobApplicationDto.isExternal,
    };

    const application = await this.prisma.jobApplication.create({
      data: payload,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Trigger XP milestone check for job application achievements
    await this.xpService.checkMilestoneAchievements(
      createJobApplicationDto.userId!,
    );

    return application;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.jobApplication.count(),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(applicationId: string) {
    const jobApplication = await this.prisma.jobApplication.findUnique({
      where: { applicationId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!jobApplication)
      throw new NotFoundException('Job application not found');
    return jobApplication;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.jobApplication.count({ where: { userId } }),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByJob(jobId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: { jobId },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.jobApplication.count({ where: { jobId } }),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(
    applicationId: string,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    const jobApplication = await this.prisma.jobApplication.findUnique({
      where: { applicationId },
    });

    if (!jobApplication)
      throw new NotFoundException('Job application not found');

    return this.prisma.jobApplication.update({
      where: { applicationId },
      data: updateJobApplicationDto,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(applicationId: string) {
    const jobApplication = await this.prisma.jobApplication.findUnique({
      where: { applicationId },
    });

    if (!jobApplication)
      throw new NotFoundException('Job application not found');

    await this.prisma.jobApplication.delete({ where: { applicationId } });
    return { message: 'Job application deleted successfully' };
  }

  async getApplicationStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, external, internal] = await Promise.all([
      this.prisma.jobApplication.count({ where }),
      this.prisma.jobApplication.count({
        where: { ...where, isExternal: true },
      }),
      this.prisma.jobApplication.count({
        where: { ...where, isExternal: false },
      }),
    ]);

    return { total, external, internal };
  }
}
