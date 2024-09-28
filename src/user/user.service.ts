import { UserRepository } from './repositories/user.repo';
import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { BaseCRUDService } from 'src/core/base/crudservice.base';
import { CreateUserDto } from './dtos/create.dto';
import { UpdateUserDTO } from './dtos/update.dto';
import { ERRORMESSAGE } from 'src/core/error/message';
import { ERRORCODES } from 'src/core/error/code';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService extends BaseCRUDService<
  User,
  CreateUserDto,
  UpdateUserDTO
> {
  constructor(private userRepo: UserRepository) {
    super(userRepo, 'user services');
  }

  async getUserInfor(userId: string, include?: string[], exclude?: string[]) {
    return await this.userRepo.findOneById({ id: userId, include, exclude });
  }

  async createUser(userInfor: CreateUserDto, createdBy: Record<string, any>) {
    const { email, password } = userInfor;
    /* Valdate email */
    const isExisted = await this.validateEmail(email);
    if (isExisted) {
      throw new BadRequestException({
        message: ERRORMESSAGE.AUTH_USER_EXIST,
        errorCode: ERRORCODES.AUTH_USER_EXIST,
      });
    }

    /* Hash password */
    const hash = await this.hashPassword(password);

    /* Create user */
    const newUser = await super.create({
      ...userInfor,
      password: hash,
      created_by: createdBy,
    } as any);

    /* Remove some fields from returned object */
    delete newUser['password'];

    /* Return data */
    return newUser;
  }

  async updateUser(
    userId: string,
    userInfor: UpdateUserDTO,
    updatedBy: Record<string, any>,
  ) {
    /* Update user */
    const updatedUser = await this.userRepo.updateOneById(userId, {
      ...userInfor,
      updated_by: updatedBy,
    } as any);

    /* Return data */
    return updatedUser;
  }

  async deleteUser(userId: string, deletedBy: Record<string, any>) {
    /* Get user */
    const user = await this.userRepo.findOneById({ id: userId });

    /* User not existed */
    if (user.is_deleted) {
      throw new BadRequestException({
        message: ERRORMESSAGE.USER_NOT_EXISTED,
        errorCode: ERRORCODES.USER_NOT_EXISTED,
      });
    }

    /* Not delete admin */
    const role = user.role.toString();
    if (role === 'admin') {
      throw new BadRequestException({
        message: ERRORMESSAGE.AUTH_NOT_DELETE_ADMIN,
        errorCode: ERRORCODES.AUTH_NOT_DELETE_ADMIN,
      });
    }

    /* Delete user */
    return await this.softDeleteById(userId, { deleted_by: deletedBy });
  }

  async getFavouriteMovieSlugs(userId: string): Promise<string[]> {
    const movies: any = await this.findOneById({
      id: userId,
      include: ['favourite_movies'],
    });

    return movies['favourite_movies'] || [];
  }

  async getRecentMovieSlugs(userId: string): Promise<string[]> {
    const movies: any = await this.findOneById({
      id: userId,
      include: ['recent_movies'],
      exclude: ['_id'],
    });

    return movies['recent_movies'];
  }

  async likeMovie(userId: string, slug: string) {
    return await this.userRepo.likeMovie(userId, slug);
  }

  async unlikeMovie(userId: string, slug: string) {
    return await this.userRepo.unlikeMovie(userId, slug);
  }

  async saveRecentMovieIfNotExisted(slug: string, userId: string) {
    return await this.userRepo.saveRecentMovieIfNotExisted(slug, userId);
  }

  async hashPassword(plain: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plain, salt);
    return hash;
  }

  async validatePassword(plain: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plain, hash);
    return isMatch;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) return null;

    const isMatched = await this.validatePassword(password, user.password);

    return isMatched ? user : null;
  }

  async validateEmail(email: string): Promise<boolean> {
    const user = await this.userRepo.findUserByEmail(email);
    return !!user;
  }
}
