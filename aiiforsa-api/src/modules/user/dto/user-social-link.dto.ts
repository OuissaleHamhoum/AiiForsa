import { IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SocialPlatform {
  LINKEDIN = 'LINKEDIN',
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  YOUTUBE = 'YOUTUBE',
  MEDIUM = 'MEDIUM',
  DEV_TO = 'DEV_TO',
  STACK_OVERFLOW = 'STACK_OVERFLOW',
  PORTFOLIO = 'PORTFOLIO',
  OTHER = 'OTHER',
}

export class CreateUserSocialLinkDto {
  @ApiProperty({
    enum: SocialPlatform,
    example: SocialPlatform.LINKEDIN,
    description: 'Social media platform',
  })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty({
    example: 'https://linkedin.com/in/johndoe',
    description: 'Social media profile URL',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    example: 'john-doe',
    description: 'Username or handle on the platform',
  })
  @IsOptional()
  @IsString()
  @Escape()
  username?: string;

  @ApiPropertyOptional({
    example: 'Professional networking profile',
    description: 'Description of the social link',
  })
  @IsOptional()
  @IsString()
  @Escape()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to display this link publicly',
  })
  @IsOptional()
  @IsString()
  isPublic?: boolean;
}

export class UpdateUserSocialLinkDto extends CreateUserSocialLinkDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Social link ID for updates',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
