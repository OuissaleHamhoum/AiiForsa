import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  CONNECTIONS_ONLY = 'CONNECTIONS_ONLY',
}

/**
 * DTO for updating user profile information
 * Supports all user fields from schema including personal, professional, and preferences
 */
export class UpdateUserProfileDto {
  // ===== BASIC PERSONAL INFORMATION =====
  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Birth date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Timezone', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Preferred language', default: 'en' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  // Location
  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  // ===== PROFILE & PRESENTATION =====
  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({ description: 'Biography text' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Professional headline' })
  @IsOptional()
  @IsString()
  headline?: string;

  // ===== PROFESSIONAL INFORMATION =====
  @ApiPropertyOptional({ description: 'Current job position' })
  @IsOptional()
  @IsString()
  currentPosition?: string;

  @ApiPropertyOptional({ description: 'Current company' })
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional({ description: 'Industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Experience level',
    enum: ExperienceLevel,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ description: 'Years of experience' })
  @IsOptional()
  @IsInt()
  yearsExperience?: number;

  @ApiPropertyOptional({ description: 'Professional summary' })
  @IsOptional()
  @IsString()
  professionalSummary?: string;

  // ===== CAREER PREFERENCES =====
  @ApiPropertyOptional({ description: 'Desired minimum salary' })
  @IsOptional()
  @IsNumber()
  desiredSalaryMin?: number;

  @ApiPropertyOptional({ description: 'Desired maximum salary' })
  @IsOptional()
  @IsNumber()
  desiredSalaryMax?: number;

  @ApiPropertyOptional({ description: 'Salary currency', default: 'USD' })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  // ===== SETTINGS & PREFERENCES =====
  @ApiPropertyOptional({
    description: 'UI theme',
    enum: Theme,
    default: 'LIGHT',
  })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  // Privacy Settings
  @ApiPropertyOptional({
    description: 'Profile visibility',
    enum: ProfileVisibility,
    default: 'PRIVATE',
  })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @ApiPropertyOptional({ description: 'Show email publicly', default: false })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiPropertyOptional({ description: 'Show phone publicly', default: false })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional({ description: 'Allow messages', default: true })
  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;

  // ===== CV PARSED DATA =====
  @ApiPropertyOptional({
    description: 'Parsed CV data in JSON format',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  cvParsed?: any;

  // ===== TERMS & COMPLIANCE =====
  @ApiPropertyOptional({ description: 'Accepted terms timestamp' })
  @IsOptional()
  @IsDateString()
  acceptedTermsAt?: string;

  @ApiPropertyOptional({ description: 'Accepted privacy policy timestamp' })
  @IsOptional()
  @IsDateString()
  acceptedPrivacyPolicyAt?: string;

  @ApiPropertyOptional({ description: 'Accepted marketing timestamp' })
  @IsOptional()
  @IsDateString()
  acceptedMarketingAt?: string;
}
