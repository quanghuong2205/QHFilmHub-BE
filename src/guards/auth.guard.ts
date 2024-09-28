import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/public.deco';
import { UserService } from 'src/user/user.service';
import { ERRORCODES } from 'src/core/error/code';
import { ERRORMESSAGE } from 'src/core/error/message';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /* Check if the guard is enable  */
    if (this.isPassed(context)) return true;

    /* Switch http context */
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest();

    /* Extract access token from header */
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException({
        errorCode: ERRORCODES.AUTH_MISS_ACCESS_TOKEN,
        message: ERRORMESSAGE.AUTH_UNAUTHORIZED,
      });
    }

    /* Verify token */
    const payload = this.authService.verifyAccessToken(token);

    /* Verify user */
    const isValidUser = await this.verifyUser(payload['_id']);
    if (!isValidUser) {
      throw new UnauthorizedException();
    }

    /* Attach payload */
    request['user'] = payload;

    /* Next guard */
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isPassed(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return isPublic;
  }

  private async verifyUser(userId: string): Promise<boolean> {
    const user = await this.userService.findOneById({
      id: userId,
    });
    return !!user;
  }
}
