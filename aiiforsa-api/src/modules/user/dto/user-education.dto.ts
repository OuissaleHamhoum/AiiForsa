import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DegreeType {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  ASSOCIATE = 'ASSOCIATE',
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  DOCTORATE = 'DOCTORATE',
  CERTIFICATE = 'CERTIFICATE',
  DIPLOMA = 'DIPLOMA',
}

export enum EducationStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  WITHDRAWN = 'WITHDRAWN',
}

export class CreateUserEducationDto {
  @ApiProperty({
    example: 'University of Technology',
    description: 'Institution name',
  })
  @IsString()
  @Escape()
  institution: string;

  @ApiProperty({
    example: 'Bachelor of Science in Computer Science',
    description: 'Degree or qualification name',
  })
  @IsString()
  @Escape()
  degree: string;

  @ApiPropertyOptional({
    enum: DegreeType,
    example: DegreeType.BACHELOR,
    description: 'Type of degree',
  })
  @IsOptional()
  @IsString()
  @Escape()
  degreeType?: string;

  @ApiPropertyOptional({
    example: 'Computer Science',
    description: 'Field of study',
  })
  @IsOptional()
  @IsString()
  @Escape()
  fieldOfStudy?: string;

  @ApiProperty({
    example: '2016-09-01',
    description: 'Start date',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2020-06-01',
    description: 'End date (null if in progress)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: EducationStatus,
    example: EducationStatus.COMPLETED,
    description: 'Education status',
  })
  @IsOptional()
  @IsString()
  @Escape()
  status?: string;

  @ApiPropertyOptional({
    example: 3.8,
    description: 'Grade point average (GPA)',
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({
    example: 'Summa Cum Laude',
    description: 'Honors or distinctions',
  })
  @IsOptional()
  @IsString()
  @Escape()
  honors?: string;

  @ApiPropertyOptional({
    example: 'Relevant coursework: Data Structures, Algorithms...',
    description: 'Relevant coursework or achievements',
  })
  @IsOptional()
  @IsString()
  @Escape()
  description?: string;

  @ApiPropertyOptional({
    example: 'New York, NY',
    description: 'Institution location',
  })
  @IsOptional()
  @IsString()
  @Escape()
  location?: string;
}

export class UpdateUserEducationDto extends CreateUserEducationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Education ID for updates',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
