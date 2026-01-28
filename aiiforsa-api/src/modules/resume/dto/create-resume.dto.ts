import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { Escape } from 'class-sanitizer';

export class CreateResumeDto {
  @ApiPropertyOptional({
    description: 'Title of the resume',
    example: 'Software Engineer Resume',
  })
  @IsString()
  @IsOptional()
  @Escape()
  title?: string;

  @ApiPropertyOptional({
    description:
      'Raw parsed CV data from parser (Gemini/Qwen) in standard format. ' +
      'Used by AI operations (review, rewrite, career advisor). ' +
      'Contains: personalInformation, workExperience, education, skills, certifications, projects, languages, etc.',
    example: {
      personalInformation: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        summary: 'Experienced software engineer...',
        links: ['https://linkedin.com/in/johndoe'],
      },
      workExperience: [
        {
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: null,
          description: ['Led team of 5 engineers', 'Built microservices'],
          tags: ['Python', 'AWS'],
        },
      ],
      education: [
        {
          degree: 'B.S. Computer Science',
          institution: 'Stanford University',
          startDate: '2015-09',
          endDate: '2019-06',
        },
      ],
      skills: ['Python', 'JavaScript', 'AWS', 'Docker'],
      certifications: [],
      projects: [],
      languages: [{ language: 'English', proficiency: 'Native' }],
    },
  })
  @IsObject()
  @IsOptional()
  data?: any;
}
