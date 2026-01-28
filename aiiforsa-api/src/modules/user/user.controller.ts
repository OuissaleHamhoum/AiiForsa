import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
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
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User details' })
  findMe(@CurrentUserId() userId: string) {
    return this.userService.findOne(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get(':userId/cv')
  @ApiOperation({ summary: 'Get user CV data' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User CV data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserCV(@Param('userId') userId: string) {
    return this.userService.getUserCV(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateMe(
    @CurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update current user comprehensive profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateMyProfile(
    @CurrentUserId() userId: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(userId, updateProfileDto);
  }

  @Post('me/cv/upload')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cv',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `cv-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Invalid file type. Only PDF, DOCX, and TXT files are allowed.',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and parse CV for current user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF, DOCX, TXT)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'CV uploaded and parsed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 404, description: 'User not found' })
  uploadAndParseCV(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded or unsupported file type',
      );
    }

    return this.userService.uploadAndParseCV(userId, file);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // ===== CV MANAGEMENT ENDPOINTS =====

  // Skills
  @Post('me/skills')
  @ApiOperation({ summary: 'Create a skill for current user' })
  @ApiResponse({
    status: 201,
    description: 'Skill created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createMySkill(
    @CurrentUserId() userId: string,
    @Body() createSkillDto: CreateUserSkillDto,
  ) {
    return this.userService.createSkill(userId, createSkillDto);
  }

  @Post(':userId/skills')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a skill for user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 201,
    description: 'Skill created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  createSkill(
    @Param('userId') userId: string,
    @Body() createSkillDto: CreateUserSkillDto,
  ) {
    return this.userService.createSkill(userId, createSkillDto);
  }

  @Get('me/skills')
  @ApiOperation({ summary: 'Get all skills for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user skills',
  })
  findMySkills(@CurrentUserId() userId: string) {
    return this.userService.findAllSkills(userId);
  }

  @Get(':userId/skills')
  @ApiOperation({ summary: 'Get all skills for user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of user skills',
  })
  findAllSkills(@Param('userId') userId: string) {
    return this.userService.findAllSkills(userId);
  }

  @Patch('me/skills/:skillId')
  @ApiOperation({ summary: 'Update current user skill' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found',
  })
  updateMySkill(
    @CurrentUserId() userId: string,
    @Param('skillId') skillId: string,
    @Body() updateSkillDto: UpdateUserSkillDto,
  ) {
    return this.userService.updateSkill(userId, skillId, updateSkillDto);
  }

  @Patch(':userId/skills/:skillId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user skill (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  updateSkill(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() updateSkillDto: UpdateUserSkillDto,
  ) {
    return this.userService.updateSkill(userId, skillId, updateSkillDto);
  }

  @Delete('me/skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user skill' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({
    status: 204,
    description: 'Skill deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found',
  })
  removeMySkill(
    @CurrentUserId() userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.userService.removeSkill(userId, skillId);
  }

  @Delete(':userId/skills/:skillId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user skill (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({
    status: 204,
    description: 'Skill deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  removeSkill(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.userService.removeSkill(userId, skillId);
  }

  // ===== "ME" ENDPOINTS FOR CURRENT USER =====

  // Work Experience - Current User
  @Post('me/work-experience')
  @ApiOperation({ summary: 'Create work experience for current user' })
  @ApiResponse({
    status: 201,
    description: 'Work experience created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMyWorkExperience(
    @CurrentUserId() userId: string,
    @Body() createWorkExpDto: CreateUserWorkExperienceDto,
  ) {
    return this.userService.createWorkExperience(userId, createWorkExpDto);
  }

  @Get('me/work-experience')
  @ApiOperation({ summary: 'Get all work experiences for current user' })
  @ApiResponse({ status: 200, description: 'List of user work experiences' })
  findMyWorkExperiences(@CurrentUserId() userId: string) {
    return this.userService.findAllWorkExperiences(userId);
  }

  @Patch('me/work-experience/:workExpId')
  @ApiOperation({ summary: 'Update current user work experience' })
  @ApiParam({ name: 'workExpId', description: 'Work Experience ID' })
  @ApiResponse({
    status: 200,
    description: 'Work experience updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Work experience not found' })
  updateMyWorkExperience(
    @CurrentUserId() userId: string,
    @Param('workExpId') workExpId: string,
    @Body() updateWorkExpDto: UpdateUserWorkExperienceDto,
  ) {
    return this.userService.updateWorkExperience(
      userId,
      workExpId,
      updateWorkExpDto,
    );
  }

  @Delete('me/work-experience/:workExpId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user work experience' })
  @ApiParam({ name: 'workExpId', description: 'Work Experience ID' })
  @ApiResponse({
    status: 204,
    description: 'Work experience deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Work experience not found' })
  removeMyWorkExperience(
    @CurrentUserId() userId: string,
    @Param('workExpId') workExpId: string,
  ) {
    return this.userService.removeWorkExperience(userId, workExpId);
  }

  // Education - Current User
  @Post('me/education')
  @ApiOperation({ summary: 'Create education for current user' })
  @ApiResponse({ status: 201, description: 'Education created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMyEducation(
    @CurrentUserId() userId: string,
    @Body() createEducationDto: CreateUserEducationDto,
  ) {
    return this.userService.createEducation(userId, createEducationDto);
  }

  @Get('me/education')
  @ApiOperation({ summary: 'Get all education records for current user' })
  @ApiResponse({ status: 200, description: 'List of user education records' })
  findMyEducations(@CurrentUserId() userId: string) {
    return this.userService.findAllEducations(userId);
  }

  @Patch('me/education/:educationId')
  @ApiOperation({ summary: 'Update current user education' })
  @ApiParam({ name: 'educationId', description: 'Education ID' })
  @ApiResponse({ status: 200, description: 'Education updated successfully' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  updateMyEducation(
    @CurrentUserId() userId: string,
    @Param('educationId') educationId: string,
    @Body() updateEducationDto: UpdateUserEducationDto,
  ) {
    return this.userService.updateEducation(
      userId,
      educationId,
      updateEducationDto,
    );
  }

  @Delete('me/education/:educationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user education' })
  @ApiParam({ name: 'educationId', description: 'Education ID' })
  @ApiResponse({ status: 204, description: 'Education deleted successfully' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  removeMyEducation(
    @CurrentUserId() userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.userService.removeEducation(userId, educationId);
  }

  // Certifications - Current User
  @Post('me/certifications')
  @ApiOperation({ summary: 'Create certification for current user' })
  @ApiResponse({
    status: 201,
    description: 'Certification created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMyCertification(
    @CurrentUserId() userId: string,
    @Body() createCertDto: CreateUserCertificationDto,
  ) {
    return this.userService.createCertification(userId, createCertDto);
  }

  @Get('me/certifications')
  @ApiOperation({ summary: 'Get all certifications for current user' })
  @ApiResponse({ status: 200, description: 'List of user certifications' })
  findMyCertifications(@CurrentUserId() userId: string) {
    return this.userService.findAllCertifications(userId);
  }

  @Patch('me/certifications/:certId')
  @ApiOperation({ summary: 'Update current user certification' })
  @ApiParam({ name: 'certId', description: 'Certification ID' })
  @ApiResponse({
    status: 200,
    description: 'Certification updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  updateMyCertification(
    @CurrentUserId() userId: string,
    @Param('certId') certId: string,
    @Body() updateCertDto: UpdateUserCertificationDto,
  ) {
    return this.userService.updateCertification(userId, certId, updateCertDto);
  }

  @Delete('me/certifications/:certId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user certification' })
  @ApiParam({ name: 'certId', description: 'Certification ID' })
  @ApiResponse({
    status: 204,
    description: 'Certification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  removeMyCertification(
    @CurrentUserId() userId: string,
    @Param('certId') certId: string,
  ) {
    return this.userService.removeCertification(userId, certId);
  }

  // Projects - Current User
  @Post('me/projects')
  @ApiOperation({ summary: 'Create project for current user' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMyProject(
    @CurrentUserId() userId: string,
    @Body() createProjectDto: CreateUserProjectDto,
  ) {
    return this.userService.createProject(userId, createProjectDto);
  }

  @Get('me/projects')
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiResponse({ status: 200, description: 'List of user projects' })
  findMyProjects(@CurrentUserId() userId: string) {
    return this.userService.findAllProjects(userId);
  }

  @Patch('me/projects/:projectId')
  @ApiOperation({ summary: 'Update current user project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  updateMyProject(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateUserProjectDto,
  ) {
    return this.userService.updateProject(userId, projectId, updateProjectDto);
  }

  @Delete('me/projects/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  removeMyProject(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.userService.removeProject(userId, projectId);
  }

  // Languages - Current User
  @Post('me/languages')
  @ApiOperation({ summary: 'Create language for current user' })
  @ApiResponse({ status: 201, description: 'Language created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMyLanguage(
    @CurrentUserId() userId: string,
    @Body() createLanguageDto: CreateUserLanguageDto,
  ) {
    return this.userService.createLanguage(userId, createLanguageDto);
  }

  @Get('me/languages')
  @ApiOperation({ summary: 'Get all languages for current user' })
  @ApiResponse({ status: 200, description: 'List of user languages' })
  findMyLanguages(@CurrentUserId() userId: string) {
    return this.userService.findAllLanguages(userId);
  }

  @Patch('me/languages/:languageId')
  @ApiOperation({ summary: 'Update current user language' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 200, description: 'Language updated successfully' })
  @ApiResponse({ status: 404, description: 'Language not found' })
  updateMyLanguage(
    @CurrentUserId() userId: string,
    @Param('languageId') languageId: string,
    @Body() updateLanguageDto: UpdateUserLanguageDto,
  ) {
    return this.userService.updateLanguage(
      userId,
      languageId,
      updateLanguageDto,
    );
  }

  @Delete('me/languages/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user language' })
  @ApiParam({ name: 'languageId', description: 'Language ID' })
  @ApiResponse({ status: 204, description: 'Language deleted successfully' })
  @ApiResponse({ status: 404, description: 'Language not found' })
  removeMyLanguage(
    @CurrentUserId() userId: string,
    @Param('languageId') languageId: string,
  ) {
    return this.userService.removeLanguage(userId, languageId);
  }

  // Social Links - Current User
  @Post('me/social-links')
  @ApiOperation({ summary: 'Create social link for current user' })
  @ApiResponse({ status: 201, description: 'Social link created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMySocialLink(
    @CurrentUserId() userId: string,
    @Body() createSocialLinkDto: CreateUserSocialLinkDto,
  ) {
    return this.userService.createSocialLink(userId, createSocialLinkDto);
  }

  @Get('me/social-links')
  @ApiOperation({ summary: 'Get all social links for current user' })
  @ApiResponse({ status: 200, description: 'List of user social links' })
  findMySocialLinks(@CurrentUserId() userId: string) {
    return this.userService.findAllSocialLinks(userId);
  }

  @Patch('me/social-links/:socialLinkId')
  @ApiOperation({ summary: 'Update current user social link' })
  @ApiParam({ name: 'socialLinkId', description: 'Social Link ID' })
  @ApiResponse({ status: 200, description: 'Social link updated successfully' })
  @ApiResponse({ status: 404, description: 'Social link not found' })
  updateMySocialLink(
    @CurrentUserId() userId: string,
    @Param('socialLinkId') socialLinkId: string,
    @Body() updateSocialLinkDto: UpdateUserSocialLinkDto,
  ) {
    return this.userService.updateSocialLink(
      userId,
      socialLinkId,
      updateSocialLinkDto,
    );
  }

  @Delete('me/social-links/:socialLinkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user social link' })
  @ApiParam({ name: 'socialLinkId', description: 'Social Link ID' })
  @ApiResponse({ status: 204, description: 'Social link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Social link not found' })
  removeMySocialLink(
    @CurrentUserId() userId: string,
    @Param('socialLinkId') socialLinkId: string,
  ) {
    return this.userService.removeSocialLink(userId, socialLinkId);
  }

  // ===== ADMIN ENDPOINTS =====

  // Work Experience
  @Post(':userId/work-experience')
  @ApiOperation({ summary: 'Create work experience for user' })
  @ApiResponse({
    status: 201,
    description: 'Work experience created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createWorkExperience(
    @Param('userId') userId: string,
    @Body() createWorkExpDto: CreateUserWorkExperienceDto,
  ) {
    return this.userService.createWorkExperience(userId, createWorkExpDto);
  }

  @Get(':userId/work-experience')
  @ApiOperation({ summary: 'Get all work experiences for user' })
  @ApiResponse({
    status: 200,
    description: 'List of user work experiences',
  })
  findAllWorkExperiences(@Param('userId') userId: string) {
    return this.userService.findAllWorkExperiences(userId);
  }

  @Patch(':userId/work-experience/:workExpId')
  @ApiOperation({ summary: 'Update user work experience' })
  @ApiResponse({
    status: 200,
    description: 'Work experience updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Work experience not found',
  })
  updateWorkExperience(
    @Param('userId') userId: string,
    @Param('workExpId') workExpId: string,
    @Body() updateWorkExpDto: UpdateUserWorkExperienceDto,
  ) {
    return this.userService.updateWorkExperience(
      userId,
      workExpId,
      updateWorkExpDto,
    );
  }

  @Delete(':userId/work-experience/:workExpId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user work experience' })
  @ApiResponse({
    status: 204,
    description: 'Work experience deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Work experience not found',
  })
  removeWorkExperience(
    @Param('userId') userId: string,
    @Param('workExpId') workExpId: string,
  ) {
    return this.userService.removeWorkExperience(userId, workExpId);
  }

  // Education
  @Post(':userId/education')
  @ApiOperation({ summary: 'Create education for user' })
  @ApiResponse({
    status: 201,
    description: 'Education created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createEducation(
    @Param('userId') userId: string,
    @Body() createEducationDto: CreateUserEducationDto,
  ) {
    return this.userService.createEducation(userId, createEducationDto);
  }

  @Get(':userId/education')
  @ApiOperation({ summary: 'Get all education records for user' })
  @ApiResponse({
    status: 200,
    description: 'List of user education records',
  })
  findAllEducations(@Param('userId') userId: string) {
    return this.userService.findAllEducations(userId);
  }

  @Patch(':userId/education/:educationId')
  @ApiOperation({ summary: 'Update user education' })
  @ApiResponse({
    status: 200,
    description: 'Education updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Education not found',
  })
  updateEducation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Body() updateEducationDto: UpdateUserEducationDto,
  ) {
    return this.userService.updateEducation(
      userId,
      educationId,
      updateEducationDto,
    );
  }

  @Delete(':userId/education/:educationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user education' })
  @ApiResponse({
    status: 204,
    description: 'Education deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Education not found',
  })
  removeEducation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.userService.removeEducation(userId, educationId);
  }

  // Certifications
  @Post(':userId/certifications')
  @ApiOperation({ summary: 'Create certification for user' })
  @ApiResponse({
    status: 201,
    description: 'Certification created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createCertification(
    @Param('userId') userId: string,
    @Body() createCertDto: CreateUserCertificationDto,
  ) {
    return this.userService.createCertification(userId, createCertDto);
  }

  @Get(':userId/certifications')
  @ApiOperation({ summary: 'Get all certifications for user' })
  @ApiResponse({
    status: 200,
    description: 'List of user certifications',
  })
  findAllCertifications(@Param('userId') userId: string) {
    return this.userService.findAllCertifications(userId);
  }

  @Patch(':userId/certifications/:certId')
  @ApiOperation({ summary: 'Update user certification' })
  @ApiResponse({
    status: 200,
    description: 'Certification updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Certification not found',
  })
  updateCertification(
    @Param('userId') userId: string,
    @Param('certId') certId: string,
    @Body() updateCertDto: UpdateUserCertificationDto,
  ) {
    return this.userService.updateCertification(userId, certId, updateCertDto);
  }

  @Delete(':userId/certifications/:certId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user certification' })
  @ApiResponse({
    status: 204,
    description: 'Certification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Certification not found',
  })
  removeCertification(
    @Param('userId') userId: string,
    @Param('certId') certId: string,
  ) {
    return this.userService.removeCertification(userId, certId);
  }

  // Projects
  @Post(':userId/projects')
  @ApiOperation({ summary: 'Create project for user' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createProject(
    @Param('userId') userId: string,
    @Body() createProjectDto: CreateUserProjectDto,
  ) {
    return this.userService.createProject(userId, createProjectDto);
  }

  @Get(':userId/projects')
  @ApiOperation({ summary: 'Get all projects for user' })
  @ApiResponse({
    status: 200,
    description: 'List of user projects',
  })
  findAllProjects(@Param('userId') userId: string) {
    return this.userService.findAllProjects(userId);
  }

  @Patch(':userId/projects/:projectId')
  @ApiOperation({ summary: 'Update user project' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  updateProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateUserProjectDto,
  ) {
    return this.userService.updateProject(userId, projectId, updateProjectDto);
  }

  @Delete(':userId/projects/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user project' })
  @ApiResponse({
    status: 204,
    description: 'Project deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  removeProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.userService.removeProject(userId, projectId);
  }

  // Languages
  @Post(':userId/languages')
  @ApiOperation({ summary: 'Create language for user' })
  @ApiResponse({
    status: 201,
    description: 'Language created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createLanguage(
    @Param('userId') userId: string,
    @Body() createLanguageDto: CreateUserLanguageDto,
  ) {
    return this.userService.createLanguage(userId, createLanguageDto);
  }

  @Get(':userId/languages')
  @ApiOperation({ summary: 'Get all languages for user' })
  @ApiResponse({
    status: 200,
    description: 'List of user languages',
  })
  findAllLanguages(@Param('userId') userId: string) {
    return this.userService.findAllLanguages(userId);
  }

  @Patch(':userId/languages/:languageId')
  @ApiOperation({ summary: 'Update user language' })
  @ApiResponse({
    status: 200,
    description: 'Language updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Language not found',
  })
  updateLanguage(
    @Param('userId') userId: string,
    @Param('languageId') languageId: string,
    @Body() updateLanguageDto: UpdateUserLanguageDto,
  ) {
    return this.userService.updateLanguage(
      userId,
      languageId,
      updateLanguageDto,
    );
  }

  @Delete(':userId/languages/:languageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user language' })
  @ApiResponse({
    status: 204,
    description: 'Language deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Language not found',
  })
  removeLanguage(
    @Param('userId') userId: string,
    @Param('languageId') languageId: string,
  ) {
    return this.userService.removeLanguage(userId, languageId);
  }

  // Social Links
  @Post(':userId/social-links')
  @ApiOperation({ summary: 'Create social link for user' })
  @ApiResponse({
    status: 201,
    description: 'Social link created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  createSocialLink(
    @Param('userId') userId: string,
    @Body() createSocialLinkDto: CreateUserSocialLinkDto,
  ) {
    return this.userService.createSocialLink(userId, createSocialLinkDto);
  }

  @Get(':userId/social-links')
  @ApiOperation({ summary: 'Get all social links for user' })
  @ApiResponse({
    status: 200,
    description: 'List of user social links',
  })
  findAllSocialLinks(@Param('userId') userId: string) {
    return this.userService.findAllSocialLinks(userId);
  }

  @Patch(':userId/social-links/:socialLinkId')
  @ApiOperation({ summary: 'Update user social link' })
  @ApiResponse({
    status: 200,
    description: 'Social link updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Social link not found',
  })
  updateSocialLink(
    @Param('userId') userId: string,
    @Param('socialLinkId') socialLinkId: string,
    @Body() updateSocialLinkDto: UpdateUserSocialLinkDto,
  ) {
    return this.userService.updateSocialLink(
      userId,
      socialLinkId,
      updateSocialLinkDto,
    );
  }

  @Delete(':userId/social-links/:socialLinkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user social link' })
  @ApiResponse({
    status: 204,
    description: 'Social link deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Social link not found',
  })
  removeSocialLink(
    @Param('userId') userId: string,
    @Param('socialLinkId') socialLinkId: string,
  ) {
    return this.userService.removeSocialLink(userId, socialLinkId);
  }

  // Complete Profile
  @Get(':userId/profile')
  @ApiOperation({ summary: 'Get complete user profile with CV data' })
  @ApiResponse({
    status: 200,
    description: 'Complete user profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findUserProfile(@Param('userId') userId: string) {
    return this.userService.findUserProfile(userId);
  }
}
