import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserCertificationDto {
  @ApiProperty({
    example: 'AWS Certified Solutions Architect',
    description: 'Certification name',
  })
  @IsString()
  @Escape()
  name: string;

  @ApiProperty({
    example: 'Amazon Web Services',
    description: 'Issuing organization',
  })
  @IsString()
  @Escape()
  issuer: string;

  @ApiPropertyOptional({
    example: '2023-05-15',
    description: 'Issue date',
  })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-15',
    description: 'Expiration date',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({
    example: 'CERT-123456',
    description: 'Certification credential ID',
  })
  @IsOptional()
  @IsString()
  @Escape()
  credentialId?: string;

  @ApiPropertyOptional({
    example: 'https://aws.amazon.com/certification',
    description: 'Certification verification URL',
  })
  @IsOptional()
  @IsUrl()
  credentialUrl?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether certification does not expire',
  })
  @IsOptional()
  @IsBoolean()
  doesNotExpire?: boolean;

  @ApiPropertyOptional({
    example: 'Demonstrates expertise in AWS cloud architecture...',
    description: 'Certification description',
  })
  @IsOptional()
  @IsString()
  @Escape()
  description?: string;
}

export class UpdateUserCertificationDto extends CreateUserCertificationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Certification ID for updates',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
