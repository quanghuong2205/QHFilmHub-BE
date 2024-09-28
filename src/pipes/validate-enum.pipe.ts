import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { ERRORCODES } from 'src/core/error/code';

@Injectable()
export class EnumValidationPipe<T> implements PipeTransform {
  constructor(private enumValues: T[]) {}
  transform(value: T, metadata: ArgumentMetadata) {
    if (!this.enumValues.includes(value)) {
      const { type, data } = metadata;
      throw new BadRequestException({
        message: `The value of ${data} of ${type} is invalid`,
        errorCode: this.getErrorCode(type),
      });
    }

    return value;
  }

  private getErrorCode(type: string) {
    switch (type) {
      case 'param':
        return ERRORCODES.REQUEST_INVALID_PARAM_VALUE;

      case 'query':
        return ERRORCODES.REQUEST_INVALID_QUERY_VALUE;

      default: {
        return ERRORCODES.INVALID_VALUE;
      }
    }
  }
}
