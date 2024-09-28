import { BaseRepository } from 'src/core/base/repository.base';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { createObjectId } from 'src/utils/mongoose/createObjectId';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel);
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.findOne({ filter: { email } });
  }

  async findUserByEmailExcludingId(email: string, userId: string) {
    return await this.findOneExcludingId({ id: userId, filter: { email } });
  }

  async likeMovie(userId: string, slug: string) {
    return await this.repo.findOneAndUpdate(
      {
        _id: createObjectId(userId),
      },
      {
        $push: { favourite_movies: slug },
      },
      { new: true },
    );
  }

  async unlikeMovie(userId: string, slug: string) {
    return await this.repo.findOneAndUpdate(
      {
        _id: createObjectId(userId),
      },
      {
        $pull: { favourite_movies: slug },
      },
      { new: true },
    );
  }

  async saveRecentMovieIfNotExisted(slug: string, userId: string) {
    return await this.repo.findOneAndUpdate(
      {
        _id: createObjectId(userId),
      },
      {
        $addToSet: { recent_movies: slug },
      },
      { new: true },
    );
  }
}
