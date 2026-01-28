import { Injectable } from '@nestjs/common';
import { ExperienceLevel, JobStatus, JobType } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';

interface AdzunaJob {
  id: number;
  title: string;
  description: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area?: string[];
  };
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created: string;
  redirect_url: string;
  category?: {
    label: string;
  };
}

@Injectable()
export class AdzunaService {
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  private readonly appId = '724f25bd';
  private readonly appKey = 'ed569c723b71c1be5e96fa8804657113';

  constructor(private prisma: PrismaService) {}

  async fetchAndStoreJobs(
    params: {
      what?: string;
      where?: string;
      maxResults?: number;
    } = {},
  ) {
    try {
      console.log('Fetching jobs from Adzuna...');

      // 1. Fetch from Adzuna API
      const adzunaJobs = await this.fetchFromAdzuna(params);

      console.log(`Found ${adzunaJobs.length} jobs from Adzuna`);

      // 2. Map and store jobs
      const jobsToCreate = adzunaJobs.map((job) => this.mapAdzunaToJob(job));

      // 3. Bulk create (check for duplicates by externalUrl)
      const createdJobs: any[] = [];
      for (const jobData of jobsToCreate) {
        try {
          // Check if job already exists by externalUrl
          const existingJob = await this.prisma.job.findFirst({
            where: { externalUrl: jobData.externalUrl },
          });

          if (!existingJob) {
            const job = await this.prisma.job.create({
              data: jobData,
            });
            createdJobs.push(job);
          }
        } catch (error) {
          console.error('Error creating job:', error);
        }
      }

      console.log(`Successfully stored ${createdJobs.length} jobs`);
      return createdJobs;
    } catch (error) {
      console.error('Error fetching Adzuna jobs:', error);
      throw error;
    }
  }

  private async fetchFromAdzuna(params: {
    what?: string;
    where?: string;
    maxResults?: number;
  }): Promise<AdzunaJob[]> {
    const response = await axios.get(`${this.baseUrl}/gb/search/1`, {
      params: {
        app_id: this.appId,
        app_key: this.appKey,
        what: params.what || 'developer',
        where: params.where || 'london',
        results_per_page: params.maxResults || 20,
      },
      timeout: 10000, // 10 second timeout
    });

    return response.data.results || [];
  }

  private mapAdzunaToJob(adzunaJob: AdzunaJob) {
    return {
      title: adzunaJob.title,
      companyName: adzunaJob.company?.display_name || 'Unknown Company',
      location: adzunaJob.location?.display_name,
      type: this.mapContractType(adzunaJob.contract_type),
      description: adzunaJob.description,
      requirements: this.extractRequirements(adzunaJob.description),
      responsibilities: this.extractResponsibilities(adzunaJob.description),
      benefits: this.extractBenefits(adzunaJob.description),
      salaryMin: adzunaJob.salary_min,
      salaryMax: adzunaJob.salary_max,
      currency: 'GBP', // Adzuna UK default
      experienceLevel: this.inferExperienceLevel(
        adzunaJob.title,
        adzunaJob.description,
      ),
      remote: this.isRemoteJob(
        adzunaJob.location?.display_name,
        adzunaJob.description,
      ),
      skills: this.extractSkills(adzunaJob.description),
      postedAt: new Date(adzunaJob.created),
      expiresAt: null,
      status: JobStatus.OPEN,
      externalUrl: adzunaJob.redirect_url,
      source: 'adzuna',
      slug: this.generateSlug(adzunaJob.title, adzunaJob.company?.display_name),
    };
  }

  private mapContractType(contractType?: string): JobType {
    if (!contractType) return JobType.FULL_TIME;

    switch (contractType.toLowerCase()) {
      case 'permanent':
        return JobType.FULL_TIME;
      case 'contract':
      case 'temporary':
        return JobType.CONTRACT;
      case 'part_time':
        return JobType.PART_TIME;
      case 'internship':
        return JobType.INTERNSHIP;
      default:
        return JobType.FULL_TIME;
    }
  }

  private inferExperienceLevel(
    title: string,
    description: string,
  ): ExperienceLevel {
    const text = (title + ' ' + description).toLowerCase();

    if (
      text.includes('senior') ||
      text.includes('lead') ||
      text.includes('principal') ||
      text.includes('architect')
    ) {
      return ExperienceLevel.SENIOR;
    }
    if (
      text.includes('junior') ||
      text.includes('entry') ||
      text.includes('graduate') ||
      text.includes('trainee')
    ) {
      return ExperienceLevel.JUNIOR;
    }
    if (text.includes('mid') || text.includes('intermediate')) {
      return ExperienceLevel.MID;
    }

    // Default based on keywords
    if (text.includes('manager') || text.includes('director')) {
      return ExperienceLevel.LEAD;
    }

    return ExperienceLevel.MID; // Default
  }

  private isRemoteJob(location?: string, description?: string): boolean {
    if (!location && !description) return false;

    const text = (location + ' ' + description).toLowerCase();
    return (
      text.includes('remote') ||
      text.includes('work from home') ||
      text.includes('wfh')
    );
  }

  private extractSkills(description: string): string[] {
    if (!description) return [];

    const commonSkills = [
      'javascript',
      'typescript',
      'python',
      'java',
      'c#',
      'php',
      'ruby',
      'go',
      'react',
      'angular',
      'vue',
      'node.js',
      'express',
      'django',
      'spring',
      'aws',
      'azure',
      'gcp',
      'docker',
      'kubernetes',
      'jenkins',
      'git',
      'mysql',
      'postgresql',
      'mongodb',
      'redis',
      'elasticsearch',
      'html',
      'css',
      'sass',
      'tailwind',
      'bootstrap',
    ];

    const foundSkills = commonSkills.filter((skill) =>
      description.toLowerCase().includes(skill.toLowerCase()),
    );

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  private extractRequirements(description: string): string | null {
    // Simple extraction - look for common requirement patterns
    if (!description) return null;

    const lines = description.split('\n');
    const requirements = lines.filter(
      (line) =>
        line.toLowerCase().includes('requirement') ||
        line.toLowerCase().includes('required') ||
        line.toLowerCase().includes('must have') ||
        line.toLowerCase().includes('experience with'),
    );

    return requirements.length > 0 ? requirements.join('\n') : null;
  }

  private extractResponsibilities(description: string): string | null {
    // Simple extraction - look for responsibility patterns
    if (!description) return null;

    const lines = description.split('\n');
    const responsibilities = lines.filter(
      (line) =>
        line.toLowerCase().includes('responsibility') ||
        line.toLowerCase().includes('responsibilities') ||
        line.toLowerCase().includes('you will') ||
        line.toLowerCase().includes('duties'),
    );

    return responsibilities.length > 0 ? responsibilities.join('\n') : null;
  }

  private extractBenefits(description: string): string | null {
    // Simple extraction - look for benefit patterns
    if (!description) return null;

    const lines = description.split('\n');
    const benefits = lines.filter(
      (line) =>
        line.toLowerCase().includes('benefit') ||
        line.toLowerCase().includes('benefits') ||
        line.toLowerCase().includes('we offer') ||
        line.toLowerCase().includes('package includes'),
    );

    return benefits.length > 0 ? benefits.join('\n') : null;
  }

  private generateSlug(title: string, companyName?: string): string {
    const base = `${title} ${companyName || ''}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    return base.substring(0, 100); // Limit length
  }
}
