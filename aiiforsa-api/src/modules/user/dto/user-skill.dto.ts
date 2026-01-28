import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export class CreateUserSkillDto {
  @ApiProperty({
    example: 'JavaScript',
    description: 'Skill name',
  })
  @IsString()
  @Escape()
  name: string;

  @ApiPropertyOptional({
    enum: SkillLevel,
    example: SkillLevel.ADVANCED,
    description: 'Skill proficiency level',
  })
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @ApiPropertyOptional({
    example: 3,
    description: 'Years of experience with this skill',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @ApiPropertyOptional({
    example: 'Proficient in modern JavaScript frameworks',
    description: 'Additional notes about the skill',
  })
  @IsOptional()
  @IsString()
  @Escape()
  notes?: string;
}

export class UpdateUserSkillDto extends CreateUserSkillDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Skill ID for updates',
  })
  @IsOptional()
  @IsInt()
  id?: number;
}
