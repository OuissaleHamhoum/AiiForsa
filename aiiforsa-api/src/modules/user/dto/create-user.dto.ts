import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, Theme, ProfileVisibility } from '@prisma/client';
import { Escape } from 'class-sanitizer';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name',
  })
  @IsOptional()
  @IsString()
  @Escape()
  name?: string;

  // Basic Personal Information
  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  @Escape()
  phone?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Birth date',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'America/New_York',
    description: 'Timezone',
  })
  @IsOptional()
  @IsString()
  @Escape()
  timezone?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Preferred language',
  })
  @IsOptional()
  @IsString()
  @Escape()
  preferredLanguage?: string;

  // Location
  @ApiPropertyOptional({
    example: '123 Main St',
    description: 'Street address',
  })
  @IsOptional()
  @IsString()
  @Escape()
  address?: string;

  @ApiPropertyOptional({
    example: 'New York',
    description: 'City',
  })
  @IsOptional()
  @IsString()
  @Escape()
  city?: string;

  @ApiPropertyOptional({
    example: 'NY',
    description: 'State/Province',
  })
  @IsOptional()
  @IsString()
  @Escape()
  state?: string;

  @ApiPropertyOptional({
    example: 'United States',
    description: 'Country',
  })
  @IsOptional()
  @IsString()
  @Escape()
  country?: string;

  @ApiPropertyOptional({
    example: '10001',
    description: 'Postal code',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  // Profile & Presentation
  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: 'Profile photo URL',
  })
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.jpg',
    description: 'Profile banner URL',
  })
  @IsOptional()
  @IsUrl()
  bannerImage?: string;

  @ApiPropertyOptional({
    example: 'Experienced software developer...',
    description: 'Bio/About section',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'Senior Software Developer',
    description: 'Professional headline',
  })
  @IsOptional()
  @IsString()
  headline?: string;

  // Professional Information
  @ApiPropertyOptional({
    example: 'Senior Developer',
    description: 'Current position',
  })
  @IsOptional()
  @IsString()
  currentPosition?: string;

  @ApiPropertyOptional({
    example: 'Tech Corp',
    description: 'Current company',
  })
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Industry',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    enum: ['JUNIOR', 'MID', 'SENIOR', 'LEAD'],
    example: 'SENIOR',
    description: 'Experience level',
  })
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @ApiPropertyOptional({
    example: 8,
    description: 'Years of experience',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @ApiPropertyOptional({
    example: 'Passionate about creating scalable solutions...',
    description: 'Professional summary',
  })
  @IsOptional()
  @IsString()
  professionalSummary?: string;

  // Career Preferences
  @ApiPropertyOptional({
    example: 75000,
    description: 'Desired minimum salary',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredSalaryMin?: number;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Desired maximum salary',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredSalaryMax?: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Salary currency',
  })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  // Settings & Preferences
  @ApiPropertyOptional({
    enum: Theme,
    example: Theme.LIGHT,
    description: 'UI theme preference',
  })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({
    enum: ProfileVisibility,
    example: ProfileVisibility.PRIVATE,
    description: 'Profile visibility',
  })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @ApiPropertyOptional({
    example: false,
    description: 'Show email publicly',
  })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Show phone publicly',
  })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Allow messages from other users',
  })
  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;
}
