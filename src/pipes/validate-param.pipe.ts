import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { ERRORCODES } from 'src/core/error/code';

@Injectable()
export class ExistanceValidationPipe<T> implements PipeTransform {
  transform(value: T, metadata: ArgumentMetadata) {
    if (!value || value === '') {
      const { type, data } = metadata;
      throw new BadRequestException({
        message: `${data} of ${type} is missing`,
        errorCode: this.getErrorCode(type),
      });
    }

    return value;
  }

  private getErrorCode(type: string) {
    switch (type) {
      case 'query':
        return ERRORCODES.REQUEST_MISS_QUERY;

      default: {
        return ERRORCODES.MISS_VALUE;
      }
    }
  }
}
