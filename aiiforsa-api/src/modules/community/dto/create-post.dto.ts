import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { Escape } from 'class-sanitizer';

export class CreatePostDto {
  @IsString()
  @Escape()
  caption: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @Escape()
  caption?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class CreateCommentDto {
  @IsString()
  @Escape()
  text: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;
}
