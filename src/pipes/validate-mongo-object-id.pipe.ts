import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ERRORCODES } from 'src/core/error/code';

@Injectable()
export class MongoObjectIdValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!Types.ObjectId.isValid(value)) {
      const { data } = metadata;
      throw new BadRequestException({
        message: `The ${data} is invalid`,
        errorCode: ERRORCODES.MONGO_INVALID_OBJECT_ID,
      });
    }

    return value;
  }
}
