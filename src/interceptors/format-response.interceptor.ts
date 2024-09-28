import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from 'src/decorators/response-message.deco';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    /* Get message */
    const message = this.getMessage(context);

    /* Get status code */
    const statusCode = this.getStatusCode(context);

    /* Format response */
    return next.handle().pipe(
      map((data) => {
        return {
          message,
          data: data ?? {},
          status: 'success',
          statusCode,
        };
      }),
    );
  }

  private getMessage(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private getStatusCode(context: ExecutionContext) {
    /* Http context */
    const httpContext = context.switchToHttp();
    const response: Response = httpContext.getResponse();

    /* Return code */
    return response.statusCode;
  }
}
