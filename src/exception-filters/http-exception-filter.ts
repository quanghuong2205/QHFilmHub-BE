import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ERRORCODES } from 'src/core/error/code';
import { ERRORMESSAGE } from 'src/core/error/message';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    /* Get status */
    const status = exception.getStatus();

    /* Log exception */
    console.log('exception:: ');
    console.log(exception);

    /* Format error response */
    let errorResponse = exception.getResponse();
    if (typeof errorResponse === 'string') {
      errorResponse = {
        message: errorResponse,
        errorCode: ERRORCODES.UNKNOWN,
        statusCode: status,
      };
    } else {
      errorResponse = {
        message: ERRORMESSAGE.UNKNOWN,
        errorCode: ERRORCODES.UNKNOWN,
        statusCode: status,
        ...errorResponse,
      };
    }

    /* Return response */
    response.status(status).json({
      ...errorResponse,
      status: 'error',
    });
  }
}
