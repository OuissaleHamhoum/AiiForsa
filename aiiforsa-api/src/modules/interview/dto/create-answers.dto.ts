import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerItemDto {
  @ApiProperty({ example: 'cmhk...q1', description: 'Question id' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: 'Candidate answer', description: 'Answer content' })
  @IsString()
  content: string;
}

export class CreateAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerItemDto)
  @ApiProperty({
    type: [CreateAnswerItemDto],
    description: 'Array of answers with questionId and content',
  })
  answers: CreateAnswerItemDto[];
}
