import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobRecommendationDto } from './dto/create-job-recommendation.dto';
import { UpdateJobRecommendationDto } from './dto/update-job-recommendation.dto';

@Injectable()
export class JobRecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateJobRecommendationDto) {
    const jobRecommendation = await this.prisma.jobRecommendation.create({
      data: createDto,
    });

    return jobRecommendation;
  }

  async findAll() {
    return this.prisma.jobRecommendation.findMany({
      include: {
        user: true,
      },
    });
  }
  async getOneForUser(id: string, userId: string) {
    const recommendation = await this.prisma.jobRecommendation.findFirst({
      where: {
        recommendationId: id,
        userId: userId,
      },
      select: {
        recommendationId: true,
        userId: true,
        jobId: true,
        matchScore: true,
        description: true,
        status: true,
        generatedAt: true,
      },
    });

    if (!recommendation) {
      throw new NotFoundException(
        `Job recommendation with ID ${id} not found for this user`,
      );
    }

    return recommendation;
  }
  async getOne(id: string) {
    const recommendation = await this.prisma.jobRecommendation.findUnique({
      where: { recommendationId: id },
      select: {
        recommendationId: true,
        userId: true,
        jobId: true,
        matchScore: true,
        description: true,
        status: true,
        generatedAt: true,
      },
    });

    if (!recommendation) {
      throw new NotFoundException(`Job recommendation with ID ${id} not found`);
    }

    return recommendation;
  }

  async findOne(id: string) {
    const jobRecommendation = await this.prisma.jobRecommendation.findUnique({
      where: { recommendationId: id },
      include: { user: true },
    });

    if (!jobRecommendation) {
      throw new NotFoundException(`JobRecommendation with ID ${id} not found`);
    }

    return jobRecommendation;
  }
  async getAdded(userId: string) {
    const jobRecommendation = await this.prisma.jobRecommendation.findFirst({
      where: {
        status: 'ADDED',
        userId: userId,
      },
      select: {
        jobId: true,
        matchScore: true,
        description: true,
        status: true,
        generatedAt: true,
      },
    });

    if (!jobRecommendation) {
      throw new NotFoundException(
        `Job recommendation with ID ${userId} not found or not ADDED`,
      );
    }

    return jobRecommendation;
  }

  async searchByDescription(keyword: string) {
    const recommendations = await this.prisma.jobRecommendation.findMany({
      where: {
        description: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
      select: {
        matchScore: true,
        description: true,
        status: true,
        generatedAt: true,
      },
    });

    if (recommendations.length === 0) {
      throw new NotFoundException(
        `No job recommendations found containing "${keyword}"`,
      );
    }

    return recommendations;
  }

  async update(id: string, updateDto: UpdateJobRecommendationDto) {
    await this.findOne(id);

    return this.prisma.jobRecommendation.update({
      where: { recommendationId: id },
      data: updateDto,
    });
  }
  async addToList(id: string) {
    await this.findOne(id);
    return this.prisma.jobRecommendation.update({
      where: { recommendationId: id },
      data: { status: 'ADDED' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.jobRecommendation.delete({
      where: { recommendationId: id },
    });

    return { message: 'JobRecommendation deleted successfully' };
  }
}
