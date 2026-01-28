import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';
import { Difficulty, InterviewCategory } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({
    example: 'Interview about backend design',
    description: 'Interview description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 60,
    description: 'Duration in minutes',
  })
  @IsNumber()
  durationMinutes: number;

  @ApiProperty({
    example: 3,
    description: 'Number of questions',
  })
  @IsNumber()
  nbrQuestions: number;

  @ApiProperty({
    example: Difficulty.MEDIUM,
    description: 'Difficulty',
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    example: InterviewCategory.TECHNICAL,
    description: 'Category',
  })
  @IsEnum(InterviewCategory)
  category: InterviewCategory;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Backend',
    description: 'Optional focus area',
    required: false,
  })
  focusArea?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @ApiProperty({
    type: [CreateQuestionDto],
    description: 'Questions for the interview',
    required: false,
  })
  questions?: CreateQuestionDto[];

  @IsString()
  @ApiProperty({ example: 'user-id', description: 'Owner user id' })
  userId: string;
}
