import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';

@Injectable()
export class WrapBodyToDataPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    console.log('WrapBodyToDataPipe input:', value);
    if (typeof value === 'object' && value !== null && !('data' in value)) {
      const wrapped = { data: value };
      console.log('Wrapped to:', wrapped);
      return wrapped;
    }
    console.log('No wrap needed');
    return value;
  }
}
