import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class BodyIsObjectPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequestException('Request body must be a valid JSON object');
    }
    return value;
  }
}
