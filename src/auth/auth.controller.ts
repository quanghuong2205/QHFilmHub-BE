import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignInDTO } from './dtos/signIn.dto';
import { Response, Request } from 'express';
import { Public } from 'src/decorators/public.deco';
import { SignUpDTO } from './dtos/signUp.dto';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';
import { AuthInfor } from 'src/decorators/auth-infor.deco';
import { ITokenPayload } from './token-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() authInfor: SignInDTO,
  ) {
    return await this.authService.signIn(authInfor, response);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() authInfor: SignUpDTO) {
    return await this.authService.signUp(authInfor);
  }

  @Post('sign-out')
  @Public()
  @UseGuards(RefreshTokenGuard)
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.signOut(request, response);
  }

  @Post('refresh-token')
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refreshTokenPair(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.refreshTokenPair(request, response);
  }

  @Get('/infor')
  @Public()
  @UseGuards(RefreshTokenGuard)
  async getUserInfor(@AuthInfor() auth: ITokenPayload) {
    return await this.userService.getUserInfor(
      auth._id,
      [],
      ['password', '__v'],
    );
  }
}
