import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { ERRORCODES } from 'src/core/error/code';
import { ERRORMESSAGE } from 'src/core/error/message';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /* Switch http context */
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest();

    /* Extract access token from header */
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException({
        errorCode: ERRORCODES.AUTH_MISS_REFRESH_TOKEN,
        message: ERRORMESSAGE.AUTH_UNAUTHORIZED,
      });
    }

    /* Verify token */
    const payload = this.authService.verifyRefreshToken(token);

    /* Verify user */
    const isValidUser = await this.verifyUser(payload['_id']);
    if (!isValidUser) {
      throw new UnauthorizedException();
    }

    /* Attach payload */
    delete payload['iat'];
    delete payload['exp'];
    request['user'] = payload;

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies['refresh_token'];
  }

  private async verifyUser(userId: string): Promise<boolean> {
    const user = await this.userService.findOneById({
      id: userId,
    });
    return !!user;
  }
}
