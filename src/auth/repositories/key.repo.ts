import { BaseRepository } from 'src/core/base/repository.base';
import { Key } from '../schemas/key.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createObjectId } from 'src/utils/mongoose/createObjectId';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyRepository extends BaseRepository<Key> {
  constructor(@InjectModel(Key.name) private keyModel: Model<Key>) {
    super(keyModel);
  }

  async updateRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<unknown> {
    return await this.updateOne(
      { _id: createObjectId(userId) },
      {
        refresh_token: refreshToken,
      },
    );
  }
}
