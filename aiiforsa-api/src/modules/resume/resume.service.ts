import {
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    forwardRef,
} from '@nestjs/common';
import { ResumeSectionType, ResumeStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { XpService } from '../xp/xp.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';

/**
 * Resume Service - Handles all resume management operations
 * Including sections, AI suggestions, and career advice
 */
@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => XpService))
    private readonly xpService: XpService,
  ) {}

  /**
   * Auto-generate sections from raw parsed CV JSON
   * This creates ResumeSection entries in the database from the raw parsed data
   */
  private async autoGenerateSectionsFromParsedData(
    resumeId: string,
    parsedData: any,
  ) {
    const sectionsToCreate: Array<{
      resumeId: string;
      type: ResumeSectionType;
      title: string;
      content: any;
      order: number;
    }> = [];
    let order = 0;

    // Profile section from personalInformation
    if (parsedData.personalInformation) {
      const pi = parsedData.personalInformation;
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.PROFILE,
        title: 'Profile',
        content: {
          name: pi.fullName || pi.name || '',
          email: pi.email || '',
          phone: pi.phone || '',
          location: pi.location || '',
          website: pi.website || '',
          links: pi.links || [],
        },
        order: order++,
      });
    }

    // Summary section
    if (parsedData.personalInformation?.summary) {
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.SUMMARY,
        title: 'Summary',
        content: {
          content: parsedData.personalInformation.summary,
        },
        order: order++,
      });
    }

    // Experience section
    if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.EXPERIENCE,
        title: 'Work Experience',
        content: {
          entries: parsedData.workExperience.map((exp: any) => ({
            company: exp.company || '',
            position: exp.jobTitle || exp.position || '',
            location: exp.location || '',
            startDate: exp.startDate || exp.start_date || '',
            endDate: exp.endDate || exp.end_date || null,
            current: exp.current || false,
            description: Array.isArray(exp.description)
              ? exp.description.join('\n')
              : exp.description || '',
            achievements: [],
          })),
        },
        order: order++,
      });
    }

    // Education section
    if (parsedData.education && Array.isArray(parsedData.education)) {
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.EDUCATION,
        title: 'Education',
        content: {
          entries: parsedData.education.map((edu: any) => ({
            institution: edu.institution || edu.school || edu.university || '',
            degree: edu.degree || '',
            major: edu.major || edu.fieldOfStudy || '',
            location: edu.location || '',
            startDate: edu.startDate || edu.start_date || '',
            endDate: edu.endDate || edu.end_date || null,
            current: edu.current || edu.isCurrent || false,
            gpa: edu.gpa || '',
            description: edu.description || '',
            achievements: [],
          })),
        },
        order: order++,
      });
    }

    // Skills section
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      const skillsArray = parsedData.skills.map((skill: any) =>
        typeof skill === 'string' ? skill : skill.name || skill.skill || '',
      );
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.SKILLS,
        title: 'Skills',
        content: {
          categories: [
            {
              name: 'Technical Skills',
              skills: skillsArray,
            },
          ],
        },
        order: order++,
      });
    }

    // Projects section
    if (parsedData.projects && Array.isArray(parsedData.projects)) {
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.PROJECTS,
        title: 'Projects',
        content: {
          entries: parsedData.projects.map((proj: any) => ({
            name: proj.name || proj.title || proj.projectName || '',
            description: proj.description || proj.summary || '',
            technologies:
              proj.technologies || proj.tech_stack || proj.tags || [],
            startDate: proj.startDate || proj.start_date || '',
            endDate: proj.endDate || proj.end_date || '',
            current: proj.current || proj.isCurrent || false,
            url: proj.url || proj.link || proj.github || '',
            githubUrl: proj.githubUrl || proj.github || '',
            highlights: [],
          })),
        },
        order: order++,
      });
    }

    // Languages section
    if (parsedData.languages && Array.isArray(parsedData.languages)) {
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.LANGUAGES,
        title: 'Languages',
        content: {
          entries: parsedData.languages.map((lang: any) => ({
            language:
              typeof lang === 'string'
                ? lang
                : lang.name || lang.language || '',
            proficiency:
              lang.proficiency ||
              lang.level ||
              lang.proficiencyLevel ||
              'intermediate',
          })),
        },
        order: order++,
      });
    }

    // Certifications section
    if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
      sectionsToCreate.push({
        resumeId,
        type: ResumeSectionType.CERTIFICATIONS,
        title: 'Certifications',
        content: {
          entries: parsedData.certifications.map((cert: any) => ({
            name:
              cert.name || cert.certification || cert.certificationName || '',
            issuer: cert.issuer || cert.organization || '',
            date: cert.date || cert.issueDate || cert.issue_date || '',
            expiryDate: cert.expiryDate || cert.expirationDate || '',
            credentialId: cert.credentialId || cert.credential_id || '',
            credentialUrl: cert.url || cert.credentialUrl || '',
          })),
        },
        order: order++,
      });
    }

    // Create all sections in batch
    if (sectionsToCreate.length > 0) {
      await this.prisma.resumeSection.createMany({
        data: sectionsToCreate,
      });
    }
  }

  // Utility method to convert string to ResumeSectionType enum
  private stringToResumeSectionType(type: string): ResumeSectionType {
    const upperType = type.toUpperCase();
    switch (upperType) {
      case 'PROFILE':
      case 'PERSONAL_INFO':
        return ResumeSectionType.PROFILE;
      case 'SUMMARY':
        return ResumeSectionType.SUMMARY;
      case 'EXPERIENCE':
        return ResumeSectionType.EXPERIENCE;
      case 'EDUCATION':
        return ResumeSectionType.EDUCATION;
      case 'SKILLS':
        return ResumeSectionType.SKILLS;
      case 'CERTIFICATIONS':
        return ResumeSectionType.CERTIFICATIONS;
      case 'PROJECTS':
        return ResumeSectionType.PROJECTS;
      case 'LANGUAGES':
        return ResumeSectionType.LANGUAGES;
      case 'LINKS':
      case 'COURSES':
      case 'AWARDS':
      case 'PUBLICATIONS':
      case 'VOLUNTEER':
      case 'REFERENCES':
      case 'CUSTOM':
        return ResumeSectionType.CUSTOM; // Map unsupported types to custom
      default:
        throw new Error(`Invalid section type: ${type}`);
    }
  }

  // ============================================================================
  // RESUME MANAGEMENT
  // ============================================================================

  async create(userId: string, dto: CreateResumeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userName = user.name || 'Unknown User';

    // Store RAW parsed CV JSON in data field (for AI operations like review, rewrite, career advisor)
    // This ensures compatibility with Gradio Python service expectations
    const resume = await this.prisma.resume.create({
      data: {
        userId,
        userName,
        title: dto.title || 'My Resume',
        data: dto.data || {}, // Raw parsed JSON format (personalInformation, workExperience, etc.)
      },
      include: {
        sections: true,
        suggestions: true,
      },
    });

    // Trigger XP milestone check for resume achievements
    await this.xpService.checkMilestoneAchievements(userId);

    // Auto-generate sections from raw parsed data if it exists
    // This allows Resume Builder to work immediately after CV import
    if (dto.data && Object.keys(dto.data).length > 0) {
      await this.autoGenerateSectionsFromParsedData(resume.id, dto.data);

      // Return updated resume with sections
      return this.prisma.resume.findUnique({
        where: { id: resume.id },
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
          suggestions: true,
        },
      });
    }

    return resume;
  }

  async findAllByUser(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            sections: true,
            suggestions: true,
          },
        },
      },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            suggestions: {
              where: { status: 'pending' },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        suggestions: {
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();
    return resume;
  }

  async updateReplaceData(userId: string, id: string, dto: UpdateResumeDto) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resume.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.data && { data: dto.data }),
      },
    });
  }

  async updateMetadata(
    userId: string,
    id: string,
    metadata: {
      title?: string;
      status?: ResumeStatus;
      templateId?: string;
      customStyles?: any;
      aiScore?: number;
      lastReviewedAt?: Date;
      careerAdvice?: any;
    },
  ) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resume.update({
      where: { id },
      data: metadata,
    });
  }

  async remove(userId: string, id: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resume.delete({ where: { id } });
  }

  async attachFile(
    userId: string,
    id: string,
    fileMeta: {
      filePath: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
    },
  ) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resume.update({
      where: { id },
      data: {
        filePath: fileMeta.filePath,
        fileName: fileMeta.fileName,
        mimeType: fileMeta.mimeType,
        fileSize: fileMeta.fileSize,
      },
    });
  }

  // ============================================================================
  // SECTION MANAGEMENT
  // ============================================================================

  async createSection(userId: string, resumeId: string, dto: CreateSectionDto) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resumeSection.create({
      data: {
        resumeId,
        type: this.stringToResumeSectionType(dto.type),
        title: dto.title,
        content: dto.content,
        order: dto.order ?? 0,
      },
    });
  }

  async getSections(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resumeSection.findMany({
      where: { resumeId },
      orderBy: { order: 'asc' },
      include: {
        suggestions: {
          where: { status: 'pending' },
        },
      },
    });
  }

  async getSection(userId: string, sectionId: string) {
    const section = await this.prisma.resumeSection.findUnique({
      where: { id: sectionId },
      include: {
        resume: true,
        suggestions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!section) throw new NotFoundException('Section not found');
    if (section.resume.userId !== userId) throw new ForbiddenException();

    return section;
  }

  async updateSection(
    userId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) {
    const section = await this.prisma.resumeSection.findUnique({
      where: { id: sectionId },
      include: { resume: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    if (section.resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resumeSection.update({
      where: { id: sectionId },
      data: {
        ...(dto.type && { type: this.stringToResumeSectionType(dto.type) }),
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async deleteSection(userId: string, sectionId: string) {
    const section = await this.prisma.resumeSection.findUnique({
      where: { id: sectionId },
      include: { resume: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    if (section.resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resumeSection.delete({ where: { id: sectionId } });
  }

  async reorderSections(
    userId: string,
    resumeId: string,
    sectionOrders: { id: string; order: number }[],
  ) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    await Promise.all(
      sectionOrders.map((item) =>
        this.prisma.resumeSection.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return this.getSections(userId, resumeId);
  }

  // ============================================================================
  // SUGGESTION MANAGEMENT
  // ============================================================================

  async createSuggestion(
    userId: string,
    resumeId: string,
    dto: CreateSuggestionDto,
  ) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    if (dto.sectionId) {
      const section = await this.prisma.resumeSection.findUnique({
        where: { id: dto.sectionId },
      });
      if (!section || section.resumeId !== resumeId) {
        throw new NotFoundException('Section not found in this resume');
      }
    }

    return this.prisma.resumeSuggestion.create({
      data: {
        resumeId,
        sectionId: dto.sectionId,
        type: dto.type,
        original: dto.original,
        suggested: dto.suggested,
        reason: dto.reason || '',
      },
    });
  }

  async getSuggestions(
    userId: string,
    resumeId: string,
    status?: string,
    sectionId?: string,
  ) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resumeSuggestion.findMany({
      where: {
        resumeId,
        ...(status && { status }),
        ...(sectionId && { sectionId }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        section: {
          select: {
            id: true,
            type: true,
            title: true,
          },
        },
      },
    });
  }

  async updateSuggestion(
    userId: string,
    suggestionId: string,
    dto: UpdateSuggestionDto,
  ) {
    const suggestion = await this.prisma.resumeSuggestion.findUnique({
      where: { id: suggestionId },
      include: { resume: true, section: true },
    });
    if (!suggestion) throw new NotFoundException('Suggestion not found');
    if (suggestion.resume && suggestion.resume.userId !== userId) {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.resumeSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: dto.status,
        ...(dto.status === 'accepted' && { appliedAt: new Date() }),
      },
    });

    // If accepted, apply the suggestion to the section
    if (dto.status === 'accepted' && suggestion.section) {
      await this.prisma.resumeSection.update({
        where: { id: suggestion.sectionId! },
        data: {
          content: suggestion.suggested as any,
        },
      });
    }

    return updated;
  }

  async deleteSuggestion(userId: string, suggestionId: string) {
    const suggestion = await this.prisma.resumeSuggestion.findUnique({
      where: { id: suggestionId },
      include: { resume: true },
    });
    if (!suggestion) throw new NotFoundException('Suggestion not found');
    if (suggestion.resume && suggestion.resume.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.resumeSuggestion.delete({ where: { id: suggestionId } });
  }

  // ============================================================================
  // RESUME SHARING
  // ============================================================================

  /**
   * Generate a shareable link for a resume
   */
  async generateShareLink(
    userId: string,
    id: string,
    options?: { expiry?: Date },
  ) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    // Generate unique slug
    const shareSlug = this.generateUniqueSlug();

    await this.prisma.resume.update({
      where: { id },
      data: {
        shareSlug,
        isPublic: true,
        shareExpiry: options?.expiry,
      },
    });

    return {
      shareUrl: `/resume/share/${shareSlug}`,
      shareSlug,
      isPublic: true,
      shareExpiry: options?.expiry,
    };
  }

  /**
   * Get resume by share slug (public access)
   */
  async getByShareSlug(slug: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { shareSlug: slug, isPublic: true },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException(
        'Resume not found or not publicly accessible',
      );
    }

    // Check expiry
    if (resume.shareExpiry && new Date() > resume.shareExpiry) {
      throw new NotFoundException('Share link has expired');
    }

    // Increment view count
    await this.prisma.resume.update({
      where: { id: resume.id },
      data: {
        shareViews: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    return resume;
  }

  /**
   * Revoke share link
   */
  async revokeShareLink(userId: string, id: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resume.update({
      where: { id },
      data: {
        shareSlug: null,
        isPublic: false,
        shareExpiry: null,
      },
    });
  }

  /**
   * Get share statistics
   */
  async getShareStats(userId: string, id: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      select: {
        userId: true,
        shareSlug: true,
        isPublic: true,
        shareViews: true,
        shareExpiry: true,
        lastViewedAt: true,
      },
    });

    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return resume;
  }

  /**
   * Generate unique slug for sharing
   */
  private generateUniqueSlug(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let slug = '';
    for (let i = 0; i < 12; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  }
}
