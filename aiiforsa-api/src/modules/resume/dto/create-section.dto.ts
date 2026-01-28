import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsInt, IsOptional } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({
    description: 'Section type',
    example: 'EXPERIENCE',
    enum: [
      'PERSONAL_INFO',
      'SUMMARY',
      'EXPERIENCE',
      'EDUCATION',
      'SKILLS',
      'CERTIFICATIONS',
      'PROJECTS',
      'LANGUAGES',
      'CUSTOM',
    ],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Section title',
    example: 'Work Experience',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Section content as JSON',
    example: {
      items: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2020-01',
          endDate: '2023-12',
        },
      ],
    },
  })
  @IsObject()
  content: any;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  order?: number;
}
