import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateSuggestionDto {
  @ApiProperty({
    description: 'Suggestion status',
    enum: ['pending', 'accepted', 'rejected'],
  })
  @IsString()
  @IsIn(['pending', 'accepted', 'rejected'])
  status: 'pending' | 'accepted' | 'rejected';
}
