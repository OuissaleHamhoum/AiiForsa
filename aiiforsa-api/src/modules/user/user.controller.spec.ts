import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let app: INestApplication;

  const mockUser = {
    id: 'test-id-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updatePassword: jest.fn(),
    createSkill: jest.fn(),
    findAllSkills: jest.fn(),
    updateSkill: jest.fn(),
    removeSkill: jest.fn(),
    createWorkExperience: jest.fn(),
    findAllWorkExperiences: jest.fn(),
    updateWorkExperience: jest.fn(),
    removeWorkExperience: jest.fn(),
    createEducation: jest.fn(),
    findAllEducations: jest.fn(),
    updateEducation: jest.fn(),
    removeEducation: jest.fn(),
    createCertification: jest.fn(),
    findAllCertifications: jest.fn(),
    updateCertification: jest.fn(),
    removeCertification: jest.fn(),
    createProject: jest.fn(),
    findAllProjects: jest.fn(),
    updateProject: jest.fn(),
    removeProject: jest.fn(),
    createLanguage: jest.fn(),
    findAllLanguages: jest.fn(),
    updateLanguage: jest.fn(),
    removeLanguage: jest.fn(),
    createSocialLink: jest.fn(),
    findAllSocialLinks: jest.fn(),
    updateSocialLink: jest.fn(),
    removeSocialLink: jest.fn(),
    findUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      mockUserService.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      const result = await controller.create(createUserDto as any);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result.email).toBe(createUserDto.email);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser, { ...mockUser, id: 'test-id-456' }];

      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an empty array when no users exist', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('test-id-123');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('test-id-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findMe', () => {
    it('should return current user profile', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findMe('test-id-123');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('test-id-123');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        'test-id-123',
        updateUserDto as any,
      );

      expect(service.update).toHaveBeenCalledWith('test-id-123', updateUserDto);
      expect(result.name).toBe(updateUserDto.name);
    });
  });

  describe('updateMe', () => {
    it('should update current user profile', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(
        'test-id-123',
        updateUserDto as any,
      );

      expect(service.update).toHaveBeenCalledWith('test-id-123', updateUserDto);
      expect(result.name).toBe(updateUserDto.name);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUserService.remove.mockResolvedValue({
        message: 'User deleted successfully',
      });

      const result = await controller.remove('test-id-123');

      expect(service.remove).toHaveBeenCalledWith('test-id-123');
      expect(result.message).toBe('User deleted successfully');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Skills', () => {
    describe('createMySkill', () => {
      it('should create a skill for current user', async () => {
        const createSkillDto = {
          name: 'TypeScript',
          level: 'INTERMEDIATE',
        };

        const skill = {
          id: 'skill-1',
          userId: 'test-id-123',
          ...createSkillDto,
        };

        mockUserService.createSkill.mockResolvedValue(skill);

        const result = await controller.createMySkill(
          'test-id-123',
          createSkillDto as any,
        );

        expect(service.createSkill).toHaveBeenCalledWith(
          'test-id-123',
          createSkillDto,
        );
        expect(result.name).toBe(createSkillDto.name);
      });
    });

    describe('findMySkills', () => {
      it('should return all skills for current user', async () => {
        const skills = [
          { id: 'skill-1', userId: 'test-id-123', name: 'TypeScript' },
          { id: 'skill-2', userId: 'test-id-123', name: 'React' },
        ];

        mockUserService.findAllSkills.mockResolvedValue(skills);

        const result = await controller.findMySkills('test-id-123');

        expect(result).toEqual(skills);
        expect(service.findAllSkills).toHaveBeenCalledWith('test-id-123');
      });
    });

    describe('removeMySkill', () => {
      it('should delete a skill for current user', async () => {
        mockUserService.removeSkill.mockResolvedValue({
          message: 'Skill deleted successfully',
        });

        const result = await controller.removeMySkill('test-id-123', 'skill-1');

        expect(service.removeSkill).toHaveBeenCalledWith(
          'test-id-123',
          'skill-1',
        );
        expect(result.message).toBe('Skill deleted successfully');
      });
    });
  });

  describe('Work Experience', () => {
    describe('createWorkExperience', () => {
      it('should create work experience', async () => {
        const createWorkExpDto = {
          position: 'Senior Developer',
          company: 'Tech Corp',
          startDate: '2020-01-01',
        };

        const workExp = {
          id: 'exp-1',
          userId: 'test-id-123',
          ...createWorkExpDto,
        };

        mockUserService.createWorkExperience.mockResolvedValue(workExp);

        const result = await controller.createWorkExperience(
          'test-id-123',
          createWorkExpDto as any,
        );

        expect(service.createWorkExperience).toHaveBeenCalledWith(
          'test-id-123',
          createWorkExpDto,
        );
        expect(result.company).toBe(createWorkExpDto.company);
      });
    });

    describe('findAllWorkExperiences', () => {
      it('should return all work experiences', async () => {
        const workExperiences = [
          {
            id: 'exp-1',
            userId: 'test-id-123',
            position: 'Senior Developer',
            company: 'Tech Corp',
          },
        ];

        mockUserService.findAllWorkExperiences.mockResolvedValue(
          workExperiences,
        );

        const result = await controller.findAllWorkExperiences('test-id-123');

        expect(result).toEqual(workExperiences);
        expect(service.findAllWorkExperiences).toHaveBeenCalledWith(
          'test-id-123',
        );
      });
    });
  });

  describe('Education', () => {
    describe('createEducation', () => {
      it('should create education record', async () => {
        const createEducationDto = {
          institution: 'MIT',
          degree: 'Bachelor',
          fieldOfStudy: 'Computer Science',
          startDate: '2015-01-01',
        };

        const education = {
          id: 'edu-1',
          userId: 'test-id-123',
          ...createEducationDto,
        };

        mockUserService.createEducation.mockResolvedValue(education);

        const result = await controller.createEducation(
          'test-id-123',
          createEducationDto as any,
        );

        expect(service.createEducation).toHaveBeenCalledWith(
          'test-id-123',
          createEducationDto,
        );
        expect(result.institution).toBe(createEducationDto.institution);
      });
    });

    describe('findAllEducations', () => {
      it('should return all education records', async () => {
        const educations = [
          {
            id: 'edu-1',
            userId: 'test-id-123',
            institution: 'MIT',
            degree: 'Bachelor',
          },
        ];

        mockUserService.findAllEducations.mockResolvedValue(educations);

        const result = await controller.findAllEducations('test-id-123');

        expect(result).toEqual(educations);
        expect(service.findAllEducations).toHaveBeenCalledWith('test-id-123');
      });
    });
  });

  describe('Projects', () => {
    describe('createProject', () => {
      it('should create a project', async () => {
        const createProjectDto = {
          name: 'AI Chat Bot',
          description: 'An intelligent chat application',
          role: 'Full Stack Developer',
        };

        const project = {
          id: 'proj-1',
          userId: 'test-id-123',
          ...createProjectDto,
        };

        mockUserService.createProject.mockResolvedValue(project);

        const result = await controller.createProject(
          'test-id-123',
          createProjectDto as any,
        );

        expect(service.createProject).toHaveBeenCalledWith(
          'test-id-123',
          createProjectDto,
        );
        expect(result.name).toBe(createProjectDto.name);
      });
    });

    describe('findAllProjects', () => {
      it('should return all projects', async () => {
        const projects = [
          {
            id: 'proj-1',
            userId: 'test-id-123',
            name: 'AI Chat Bot',
          },
        ];

        mockUserService.findAllProjects.mockResolvedValue(projects);

        const result = await controller.findAllProjects('test-id-123');

        expect(result).toEqual(projects);
        expect(service.findAllProjects).toHaveBeenCalledWith('test-id-123');
      });
    });
  });

  describe('Languages', () => {
    describe('createLanguage', () => {
      it('should create a language', async () => {
        const createLanguageDto = {
          name: 'English',
          proficiency: 'NATIVE_OR_BILINGUAL',
        };

        const language = {
          id: 'lang-1',
          userId: 'test-id-123',
          language: createLanguageDto.name,
          proficiency: createLanguageDto.proficiency,
        };

        mockUserService.createLanguage.mockResolvedValue(language as any);

        const result = await controller.createLanguage(
          'test-id-123',
          createLanguageDto as any,
        );

        expect(service.createLanguage).toHaveBeenCalledWith(
          'test-id-123',
          createLanguageDto,
        );
        expect(result.language).toBe(createLanguageDto.name);
      });
    });

    describe('findAllLanguages', () => {
      it('should return all languages', async () => {
        const languages = [
          {
            id: 'lang-1',
            userId: 'test-id-123',
            name: 'English',
          },
        ];

        mockUserService.findAllLanguages.mockResolvedValue(languages);

        const result = await controller.findAllLanguages('test-id-123');

        expect(result).toEqual(languages);
        expect(service.findAllLanguages).toHaveBeenCalledWith('test-id-123');
      });
    });
  });

  describe('Social Links', () => {
    describe('createSocialLink', () => {
      it('should create a social link', async () => {
        const createSocialLinkDto = {
          platform: 'GITHUB',
          url: 'https://github.com/testuser',
          username: 'testuser',
        };

        const socialLink = {
          id: 'social-1',
          userId: 'test-id-123',
          type: createSocialLinkDto.platform,
          url: createSocialLinkDto.url,
          label: createSocialLinkDto.username,
        };

        mockUserService.createSocialLink.mockResolvedValue(socialLink as any);

        const result = await controller.createSocialLink(
          'test-id-123',
          createSocialLinkDto as any,
        );

        expect(service.createSocialLink).toHaveBeenCalledWith(
          'test-id-123',
          createSocialLinkDto,
        );
        expect(result.type).toBe(createSocialLinkDto.platform);
      });
    });

    describe('findAllSocialLinks', () => {
      it('should return all social links', async () => {
        const socialLinks = [
          {
            id: 'social-1',
            userId: 'test-id-123',
            platform: 'GITHUB',
            url: 'https://github.com/testuser',
          },
        ];

        mockUserService.findAllSocialLinks.mockResolvedValue(socialLinks);

        const result = await controller.findAllSocialLinks('test-id-123');

        expect(result).toEqual(socialLinks);
        expect(service.findAllSocialLinks).toHaveBeenCalledWith('test-id-123');
      });
    });
  });

  describe('findUserProfile', () => {
    it('should return complete user profile with all CV data', async () => {
      const profile = {
        ...mockUser,
        skills: [],
        workExperiences: [],
        educations: [],
        certifications: [],
        projects: [],
        languages: [],
        socialLinks: [],
      };

      mockUserService.findUserProfile.mockResolvedValue(profile);

      const result = await controller.findUserProfile('test-id-123');

      expect(result).toEqual(profile);
      expect(service.findUserProfile).toHaveBeenCalledWith('test-id-123');
    });
  });
});
