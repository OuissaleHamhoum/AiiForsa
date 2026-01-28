import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'Explain dependency injection',
    description: 'Question content',
  })
  @IsString()
  content: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAnswerDto)
  @ApiProperty({ type: CreateAnswerDto, required: false })
  answer?: CreateAnswerDto;
}
