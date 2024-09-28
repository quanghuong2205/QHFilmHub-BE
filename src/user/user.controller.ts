import { CreateUserDto } from './dtos/create.dto';
import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UpdateUserDTO } from './dtos/update.dto';
import { AuthInfor } from 'src/decorators/auth-infor.deco';
import { ITokenPayload } from 'src/auth/token-payload.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/many')
  async getUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query() query: string,
  ) {
    /* Get users */
    const users = await this.userService.findMany({
      query,
      page: +page,
      limit: +limit,
      exclude: ['password', '__v'],
    } as any);

    /* Return data */
    return {
      users,
    };
  }

  @Get('/:id')
  async getUser(@Param('id') userId: string) {
    /* Get user */
    const user = await this.userService.findOneById({
      id: userId,
    });

    /* Return data */
    return {
      user,
    };
  }

  @Post('/')
  async createUser(
    @Body() userInfor: CreateUserDto,
    @AuthInfor() auth: ITokenPayload,
  ) {
    /* Get auth */
    const createdBy = {
      _id: auth._id,
      email: auth.email,
    };

    /* Return data */
    return {
      user: await this.userService.createUser(userInfor, createdBy),
    };
  }

  @Put('/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() userInfor: UpdateUserDTO,
    @AuthInfor() auth: ITokenPayload,
  ) {
    /* Get auth */
    const updatedBy = {
      _id: auth._id,
      email: auth.email,
    };

    /* Update user */
    await this.userService.updateUser(userId, userInfor, updatedBy);

    /* Return data */
    return {
      user: {
        _id: userId,
      },
    };
  }

  @Delete('/:id')
  async deleteUser(
    @Param('id') userId: string,
    @AuthInfor() auth: ITokenPayload,
  ) {
    /* Get auth */
    const deletedBy = {
      _id: auth._id,
      email: auth.email,
    };

    /* Delete user */
    await this.userService.deleteUser(userId, deletedBy);

    /* Return data */
    return {
      user: {
        _id: userId,
      },
    };
  }
}
