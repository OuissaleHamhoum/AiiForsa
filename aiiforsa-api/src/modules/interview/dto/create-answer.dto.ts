import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({
    example: 'Candidate answer content',
    description: 'Answer content',
  })
  @IsString()
  content: string;
}
