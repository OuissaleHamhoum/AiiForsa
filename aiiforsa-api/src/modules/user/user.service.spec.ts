import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { UserService } from './user.service';

// Mock bcrypt
jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'test-id-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    role: 'USER',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    experienceLevel: null,
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userSkill: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userWorkExperience: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userEducation: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userCertification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userProject: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userLanguage: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userSocialLink: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'plain-password',
      };

      const hashedPassword = 'hashed-new-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      });

      const result = await service.create(createUserDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserDto.email,
          password: hashedPassword,
        }),
      });
      expect(result.email).toBe(createUserDto.email);
    });

    it('should call hash with correct salt rounds', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test',
        password: 'password',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      await service.create(createUserDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 12);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        { ...mockUser, password: undefined },
        { ...mockUser, id: 'test-id-456', password: undefined },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
        }),
      });
    });

    it('should exclude password field from response', async () => {
      const userWithoutPassword = { ...mockUser };
      delete (userWithoutPassword as any).password;

      mockPrismaService.user.findMany.mockResolvedValue([userWithoutPassword]);

      const result = await service.findAll();

      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('test-id-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'User with ID invalid-id not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user without password', async () => {
      const updateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.update('test-id-123', updateUserDto as any);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: expect.any(Object),
        select: expect.any(Object),
      });
      expect(result.name).toBe(updateUserDto.name);
    });

    it('should hash password if provided', async () => {
      const updateUserDto = {
        name: 'Updated Name',
        password: 'new-password',
      };

      const hashedPassword = 'hashed-new-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: updateUserDto.name,
      });

      await service.update('test-id-123', updateUserDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 12);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('test-id-123');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify user exists before deletion', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('test-id-123')).rejects.toThrow();

      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update user password with hash', async () => {
      const hashedPassword = 'hashed-new-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await service.updatePassword('test-id-123', 'new-password');

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 12);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: { password: hashedPassword },
        select: expect.any(Object),
      });
    });
  });

  describe('Skills', () => {
    describe('createSkill', () => {
      it('should create a user skill', async () => {
        const createSkillDto = {
          name: 'TypeScript',
          level: 'INTERMEDIATE',
          yearsExperience: 3,
        };

        const skill = {
          id: 'skill-1',
          userId: 'test-id-123',
          ...createSkillDto,
        };

        mockPrismaService.userSkill.create.mockResolvedValue(skill);

        const result = await service.createSkill(
          'test-id-123',
          createSkillDto as any,
        );

        expect(result).toEqual(skill);
        expect(mockPrismaService.userSkill.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'test-id-123',
            name: 'TypeScript',
          }),
        });
      });
    });

    describe('findAllSkills', () => {
      it('should return all skills for a user', async () => {
        const skills = [
          { id: 'skill-1', userId: 'test-id-123', name: 'TypeScript' },
          { id: 'skill-2', userId: 'test-id-123', name: 'React' },
        ];

        mockPrismaService.userSkill.findMany.mockResolvedValue(skills);

        const result = await service.findAllSkills('test-id-123');

        expect(result).toEqual(skills);
        expect(mockPrismaService.userSkill.findMany).toHaveBeenCalledWith({
          where: { userId: 'test-id-123' },
          orderBy: { order: 'asc' },
        });
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

      mockPrismaService.user.findUnique.mockResolvedValue(profile);

      const result = await service.findUserProfile('test-id-123');

      expect(result).toEqual(profile);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        include: expect.objectContaining({
          skills: true,
          workExperiences: true,
          educations: true,
        }),
      });
    });
  });
});
