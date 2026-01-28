import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LanguageProficiency {
  ELEMENTARY = 'ELEMENTARY',
  LIMITED_WORKING = 'LIMITED_WORKING',
  PROFESSIONAL_WORKING = 'PROFESSIONAL_WORKING',
  FULL_PROFESSIONAL = 'FULL_PROFESSIONAL',
  NATIVE = 'NATIVE',
}

export class CreateUserLanguageDto {
  @ApiProperty({
    example: 'Spanish',
    description: 'Language name',
  })
  @IsString()
  @Escape()
  name: string;

  @ApiPropertyOptional({
    enum: LanguageProficiency,
    example: LanguageProficiency.PROFESSIONAL_WORKING,
    description: 'Language proficiency level',
  })
  @IsOptional()
  @IsEnum(LanguageProficiency)
  proficiency?: LanguageProficiency;

  @ApiPropertyOptional({
    example: 'Fluent in business Spanish',
    description: 'Additional notes about language skills',
  })
  @IsOptional()
  @IsString()
  @Escape()
  notes?: string;
}

export class UpdateUserLanguageDto extends CreateUserLanguageDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Language ID for updates',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
