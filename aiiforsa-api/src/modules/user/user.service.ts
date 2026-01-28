import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { GradioService } from '../resume/gradio.service';
import { XpService } from '../xp/xp.service';
import { ClamAVService } from '../../common/services/clamav.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    CreateUserCertificationDto,
    UpdateUserCertificationDto,
} from './dto/user-certification.dto';
import {
    CreateUserEducationDto,
    UpdateUserEducationDto,
} from './dto/user-education.dto';
import {
    CreateUserLanguageDto,
    UpdateUserLanguageDto,
} from './dto/user-language.dto';
import {
    CreateUserProjectDto,
    UpdateUserProjectDto,
} from './dto/user-project.dto';
import { CreateUserSkillDto, UpdateUserSkillDto } from './dto/user-skill.dto';
import {
    CreateUserSocialLinkDto,
    UpdateUserSocialLinkDto,
} from './dto/user-social-link.dto';
import {
    CreateUserWorkExperienceDto,
    UpdateUserWorkExperienceDto,
} from './dto/user-work-experience.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gradioService: GradioService,
    private readonly xpService: XpService,
    private readonly clamavService: ClamAVService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        experienceLevel: createUserDto.experienceLevel as any,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        cvParsed: true,
        // Profile fields
        bio: true,
        headline: true,
        professionalSummary: true,
        phone: true,
        gender: true,
        birthDate: true,
        timezone: true,
        preferredLanguage: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        profileImage: true,
        bannerImage: true,
        currentPosition: true,
        currentCompany: true,
        industry: true,
        experienceLevel: true,
        yearsExperience: true,
        desiredSalaryMin: true,
        desiredSalaryMax: true,
        salaryCurrency: true,
        theme: true,
        profileVisibility: true,
        showEmail: true,
        showPhone: true,
        allowMessages: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async getUserCV(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cvParsed: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.cvParsed;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        experienceLevel: updateUserDto.experienceLevel as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user profile with comprehensive fields support
   */
  async updateProfile(id: string, updateProfileDto: UpdateUserProfileDto) {
    await this.findOne(id);

    const updateData: any = { ...updateProfileDto };

    // Handle date conversions if needed
    if (updateProfileDto.birthDate) {
      updateData.birthDate = new Date(updateProfileDto.birthDate);
    }
    if (updateProfileDto.acceptedTermsAt) {
      updateData.acceptedTermsAt = new Date(updateProfileDto.acceptedTermsAt);
    }
    if (updateProfileDto.acceptedPrivacyPolicyAt) {
      updateData.acceptedPrivacyPolicyAt = new Date(
        updateProfileDto.acceptedPrivacyPolicyAt,
      );
    }
    if (updateProfileDto.acceptedMarketingAt) {
      updateData.acceptedMarketingAt = new Date(
        updateProfileDto.acceptedMarketingAt,
      );
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        gender: true,
        birthDate: true,
        timezone: true,
        preferredLanguage: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        profileImage: true,
        bannerImage: true,
        bio: true,
        headline: true,
        currentPosition: true,
        currentCompany: true,
        industry: true,
        experienceLevel: true,
        yearsExperience: true,
        professionalSummary: true,
        desiredSalaryMin: true,
        desiredSalaryMax: true,
        salaryCurrency: true,
        theme: true,
        profileVisibility: true,
        showEmail: true,
        showPhone: true,
        allowMessages: true,
        cvParsed: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Trigger XP milestone check for profile achievements
    await this.xpService.checkMilestoneAchievements(id);

    return user;
  }

  /**
   * Upload and parse CV using Gradio Qwen service
   */
  async uploadAndParseCV(userId: string, file: Express.Multer.File) {
    await this.findOne(userId);

    // Read file from disk if buffer is not available (diskStorage)
    let fileBuffer: Buffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      const fs = await import('fs/promises');
      fileBuffer = await fs.readFile(file.path);
    } else {
      throw new Error('File data not available');
    }

    // Scan file for viruses using ClamAV
    const scanResult = await this.clamavService.scanBuffer(fileBuffer, file.originalname);
    if (!scanResult.isClean) {
      throw new BadRequestException(
        `File rejected: Virus detected (${scanResult.viruses.join(', ')})`
      );
    }

    // Parse CV using Gradio service
    const parseResult = await this.gradioService.parseResumeQwen(
      fileBuffer,
      file.originalname,
    );

    // Update user's cvParsed field
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cvParsed: parseResult.json || parseResult,
      },
      select: {
        id: true,
        email: true,
        name: true,
        cvParsed: true,
      },
    });

    return {
      success: true,
      message: 'CV parsed and saved successfully',
      data: user,
      parsedCV: parseResult.json || parseResult,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  // ===== CV MANAGEMENT METHODS =====

  // Skills
  async createSkill(userId: string, createSkillDto: CreateUserSkillDto) {
    const skill = await this.prisma.userSkill.create({
      data: {
        userId,
        name: createSkillDto.name,
        level: createSkillDto.level || 'BEGINNER',
        yearsExperience: createSkillDto.yearsExperience,
        category: createSkillDto.notes, // Using notes as category for now
      },
    });

    // Trigger XP milestone check for skill achievements
    await this.xpService.checkMilestoneAchievements(userId);

    return skill;
  }

  async findAllSkills(userId: string) {
    return await this.prisma.userSkill.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async updateSkill(
    userId: string,
    skillId: string,
    updateSkillDto: UpdateUserSkillDto,
  ) {
    const updateData: any = {};
    if (updateSkillDto.name) updateData.name = updateSkillDto.name;
    if (updateSkillDto.level) updateData.level = updateSkillDto.level;
    if (updateSkillDto.yearsExperience !== undefined)
      updateData.yearsExperience = updateSkillDto.yearsExperience;
    if (updateSkillDto.notes) updateData.category = updateSkillDto.notes;

    return await this.prisma.userSkill.update({
      where: {
        id: skillId,
        userId,
      },
      data: updateData,
    });
  }

  async removeSkill(userId: string, skillId: string) {
    await this.prisma.userSkill.delete({
      where: {
        id: skillId,
        userId,
      },
    });
    return { message: 'Skill deleted successfully' };
  }

  // Work Experience
  async createWorkExperience(
    userId: string,
    createWorkExpDto: CreateUserWorkExperienceDto,
  ) {
    const workExp = await this.prisma.userWorkExperience.create({
      data: {
        userId,
        jobTitle: createWorkExpDto.position,
        company: createWorkExpDto.company,
        location: createWorkExpDto.location,
        startDate: new Date(createWorkExpDto.startDate),
        endDate: createWorkExpDto.endDate
          ? new Date(createWorkExpDto.endDate)
          : null,
        isCurrent: createWorkExpDto.isCurrentPosition || false,
        description: createWorkExpDto.description,
      },
    });

    // Trigger XP milestone check for work experience achievements
    await this.xpService.checkMilestoneAchievements(userId);

    return workExp;
  }

  async findAllWorkExperiences(userId: string) {
    return await this.prisma.userWorkExperience.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateWorkExperience(
    userId: string,
    workExpId: string,
    updateWorkExpDto: UpdateUserWorkExperienceDto,
  ) {
    const updateData: any = {};
    if (updateWorkExpDto.position)
      updateData.jobTitle = updateWorkExpDto.position;
    if (updateWorkExpDto.company) updateData.company = updateWorkExpDto.company;
    if (updateWorkExpDto.location !== undefined)
      updateData.location = updateWorkExpDto.location;
    if (updateWorkExpDto.startDate)
      updateData.startDate = new Date(updateWorkExpDto.startDate);
    if (updateWorkExpDto.endDate !== undefined)
      updateData.endDate = updateWorkExpDto.endDate
        ? new Date(updateWorkExpDto.endDate)
        : null;
    if (updateWorkExpDto.isCurrentPosition !== undefined)
      updateData.isCurrent = updateWorkExpDto.isCurrentPosition;
    if (updateWorkExpDto.description !== undefined)
      updateData.description = updateWorkExpDto.description;

    return await this.prisma.userWorkExperience.update({
      where: {
        id: workExpId,
        userId,
      },
      data: updateData,
    });
  }

  async removeWorkExperience(userId: string, workExpId: string) {
    await this.prisma.userWorkExperience.delete({
      where: {
        id: workExpId,
        userId,
      },
    });
    return { message: 'Work experience deleted successfully' };
  }

  // Education
  async createEducation(
    userId: string,
    createEducationDto: CreateUserEducationDto,
  ) {
    return await this.prisma.userEducation.create({
      data: {
        userId,
        institution: createEducationDto.institution,
        degree: createEducationDto.degree,
        fieldOfStudy: createEducationDto.fieldOfStudy,
        location: createEducationDto.location,
        startDate: new Date(createEducationDto.startDate),
        endDate: createEducationDto.endDate
          ? new Date(createEducationDto.endDate)
          : null,
        isCurrent: createEducationDto.status === 'IN_PROGRESS',
        gpa: createEducationDto.gpa?.toString(),
        description: createEducationDto.description,
      },
    });
  }

  async findAllEducations(userId: string) {
    return await this.prisma.userEducation.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateEducation(
    userId: string,
    educationId: string,
    updateEducationDto: UpdateUserEducationDto,
  ) {
    const updateData: any = {};
    if (updateEducationDto.institution)
      updateData.institution = updateEducationDto.institution;
    if (updateEducationDto.degree)
      updateData.degree = updateEducationDto.degree;
    if (updateEducationDto.fieldOfStudy !== undefined)
      updateData.fieldOfStudy = updateEducationDto.fieldOfStudy;
    if (updateEducationDto.location !== undefined)
      updateData.location = updateEducationDto.location;
    if (updateEducationDto.startDate)
      updateData.startDate = new Date(updateEducationDto.startDate);
    if (updateEducationDto.endDate !== undefined)
      updateData.endDate = updateEducationDto.endDate
        ? new Date(updateEducationDto.endDate)
        : null;
    if (updateEducationDto.status !== undefined)
      updateData.isCurrent = updateEducationDto.status === 'IN_PROGRESS';
    if (updateEducationDto.gpa !== undefined)
      updateData.gpa = updateEducationDto.gpa?.toString();
    if (updateEducationDto.description !== undefined)
      updateData.description = updateEducationDto.description;

    return await this.prisma.userEducation.update({
      where: {
        id: educationId,
        userId,
      },
      data: updateData,
    });
  }

  async removeEducation(userId: string, educationId: string) {
    await this.prisma.userEducation.delete({
      where: {
        id: educationId,
        userId,
      },
    });
    return { message: 'Education deleted successfully' };
  }

  // Certifications
  async createCertification(
    userId: string,
    createCertDto: CreateUserCertificationDto,
  ) {
    return await this.prisma.userCertification.create({
      data: {
        userId,
        name: createCertDto.name,
        issuer: createCertDto.issuer,
        issueDate: createCertDto.issueDate
          ? new Date(createCertDto.issueDate)
          : new Date(),
        expiryDate: createCertDto.expirationDate
          ? new Date(createCertDto.expirationDate)
          : null,
        credentialId: createCertDto.credentialId,
        credentialUrl: createCertDto.credentialUrl,
        description: createCertDto.description,
      },
    });
  }

  async findAllCertifications(userId: string) {
    return await this.prisma.userCertification.findMany({
      where: { userId },
      orderBy: { issueDate: 'desc' },
    });
  }

  async updateCertification(
    userId: string,
    certId: string,
    updateCertDto: UpdateUserCertificationDto,
  ) {
    const updateData: any = {};
    if (updateCertDto.name) updateData.name = updateCertDto.name;
    if (updateCertDto.issuer) updateData.issuer = updateCertDto.issuer;
    if (updateCertDto.issueDate)
      updateData.issueDate = new Date(updateCertDto.issueDate);
    if (updateCertDto.expirationDate !== undefined)
      updateData.expiryDate = updateCertDto.expirationDate
        ? new Date(updateCertDto.expirationDate)
        : null;
    if (updateCertDto.credentialId !== undefined)
      updateData.credentialId = updateCertDto.credentialId;
    if (updateCertDto.credentialUrl !== undefined)
      updateData.credentialUrl = updateCertDto.credentialUrl;
    if (updateCertDto.description !== undefined)
      updateData.description = updateCertDto.description;

    return await this.prisma.userCertification.update({
      where: {
        id: certId,
        userId,
      },
      data: updateData,
    });
  }

  async removeCertification(userId: string, certId: string) {
    await this.prisma.userCertification.delete({
      where: {
        id: certId,
        userId,
      },
    });
    return { message: 'Certification deleted successfully' };
  }

  // Projects
  async createProject(userId: string, createProjectDto: CreateUserProjectDto) {
    const project = await this.prisma.userProject.create({
      data: {
        userId,
        name: createProjectDto.name,
        description: createProjectDto.description,
        role: createProjectDto.role,
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : null,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : null,
        isCurrent: !createProjectDto.endDate,
        url: createProjectDto.liveUrl,
        technologies: createProjectDto.technologies?.join(', '),
        highlights: createProjectDto.highlights,
      },
    });

    // Trigger XP milestone check for project achievements
    await this.xpService.checkMilestoneAchievements(userId);

    return project;
  }

  async findAllProjects(userId: string) {
    return await this.prisma.userProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProject(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateUserProjectDto,
  ) {
    const updateData: any = {};
    if (updateProjectDto.name) updateData.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined)
      updateData.description = updateProjectDto.description;
    if (updateProjectDto.role !== undefined)
      updateData.role = updateProjectDto.role;
    if (updateProjectDto.startDate !== undefined)
      updateData.startDate = updateProjectDto.startDate
        ? new Date(updateProjectDto.startDate)
        : null;
    if (updateProjectDto.endDate !== undefined)
      updateData.endDate = updateProjectDto.endDate
        ? new Date(updateProjectDto.endDate)
        : null;
    if (updateProjectDto.liveUrl !== undefined)
      updateData.url = updateProjectDto.liveUrl;
    if (updateProjectDto.technologies !== undefined)
      updateData.technologies = updateProjectDto.technologies?.join(', ');
    if (updateProjectDto.highlights !== undefined)
      updateData.highlights = updateProjectDto.highlights;

    return await this.prisma.userProject.update({
      where: {
        id: projectId,
        userId,
      },
      data: updateData,
    });
  }

  async removeProject(userId: string, projectId: string) {
    await this.prisma.userProject.delete({
      where: {
        id: projectId,
        userId,
      },
    });
    return { message: 'Project deleted successfully' };
  }

  // Languages
  async createLanguage(
    userId: string,
    createLanguageDto: CreateUserLanguageDto,
  ) {
    return await this.prisma.userLanguage.create({
      data: {
        userId,
        language: createLanguageDto.name,
        proficiency:
          createLanguageDto.proficiency || ('PROFESSIONAL_WORKING' as any),
      },
    });
  }

  async findAllLanguages(userId: string) {
    return await this.prisma.userLanguage.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async updateLanguage(
    userId: string,
    languageId: string,
    updateLanguageDto: UpdateUserLanguageDto,
  ) {
    const updateData: any = {};
    if (updateLanguageDto.name) updateData.language = updateLanguageDto.name;
    if (updateLanguageDto.proficiency)
      updateData.proficiency = updateLanguageDto.proficiency;

    return await this.prisma.userLanguage.update({
      where: {
        id: languageId,
        userId,
      },
      data: updateData,
    });
  }

  async removeLanguage(userId: string, languageId: string) {
    await this.prisma.userLanguage.delete({
      where: {
        id: languageId,
        userId,
      },
    });
    return { message: 'Language deleted successfully' };
  }

  // Social Links
  async createSocialLink(
    userId: string,
    createSocialLinkDto: CreateUserSocialLinkDto,
  ) {
    return await this.prisma.userSocialLink.create({
      data: {
        userId,
        type: createSocialLinkDto.platform as any,
        url: createSocialLinkDto.url,
        label: createSocialLinkDto.username,
        isPrimary: createSocialLinkDto.isPublic || false,
      },
    });
  }

  async findAllSocialLinks(userId: string) {
    return await this.prisma.userSocialLink.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async updateSocialLink(
    userId: string,
    socialLinkId: string,
    updateSocialLinkDto: UpdateUserSocialLinkDto,
  ) {
    const updateData: any = {};
    if (updateSocialLinkDto.platform)
      updateData.type = updateSocialLinkDto.platform;
    if (updateSocialLinkDto.url) updateData.url = updateSocialLinkDto.url;
    if (updateSocialLinkDto.username !== undefined)
      updateData.label = updateSocialLinkDto.username;
    if (updateSocialLinkDto.isPublic !== undefined)
      updateData.isPrimary = updateSocialLinkDto.isPublic;

    return await this.prisma.userSocialLink.update({
      where: {
        id: socialLinkId,
        userId,
      },
      data: updateData,
    });
  }

  async removeSocialLink(userId: string, socialLinkId: string) {
    await this.prisma.userSocialLink.delete({
      where: {
        id: socialLinkId,
        userId,
      },
    });
    return { message: 'Social link deleted successfully' };
  }

  // Get complete user profile with CV data
  async findUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        gender: true,
        birthDate: true,
        timezone: true,
        preferredLanguage: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        profileImage: true,
        bannerImage: true,
        bio: true,
        headline: true,
        currentPosition: true,
        currentCompany: true,
        industry: true,
        experienceLevel: true,
        yearsExperience: true,
        professionalSummary: true,
        cvParsed: true,
        createdAt: true,
        updatedAt: true,
        // Relations
        skills: true,
        workExperiences: true,
        educations: true,
        certifications: true,
        projects: true,
        languages: true,
        socialLinks: true,
        awards: true,
        publications: true,
        volunteerWork: true,
        references: true,
      },
    });
  }
}
