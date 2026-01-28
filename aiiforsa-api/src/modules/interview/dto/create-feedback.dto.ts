import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({
    example: 'Good explanation but needs examples',
    description: 'Feedback content',
  })
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'user-id',
    description: 'Author user id',
    required: false,
  })
  authorId?: string;
}
