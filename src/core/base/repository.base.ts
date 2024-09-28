import { InternalServerErrorException } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { ERRORCODES } from '../error/code';
import { select } from 'src/utils/mongoose/select.util';
import { createObjectId } from 'src/utils/mongoose/createObjectId';

export interface PopulateOptions {
  path: string;
  include?: string[];
  exclude?: string[];
}

export interface IFindOne<T> {
  filter: FilterQuery<T>;
  include?: string[];
  exclude?: string[];
  populate?: PopulateOptions[];
}

export interface IFindOneById {
  id: string;
  include?: string[];
  exclude?: string[];
  populate?: PopulateOptions[];
}

export interface IFindMany<T> {
  filter: FilterQuery<T>;
  include?: string[];
  exclude?: string[];
  limit?: number;
  skip?: number;
  sort?: Record<string, any>;
  populate?: PopulateOptions[];
}

export class BaseRepository<T> {
  protected repo: Model<T>;
  constructor(repo: Model<T>) {
    this.repo = repo;
  }

  getRepo() {
    return this.repo;
  }

  async findOne({
    filter,
    include,
    exclude,
    populate,
  }: IFindOne<T>): Promise<T> {
    try {
      return await this.repo
        .findOne(filter)
        .select(select(include, exclude))
        .populate(this.convertToPopulateArray(populate))
        .lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_FIND,
      });
    }
  }

  async findOneById({
    id,
    include,
    exclude,
    populate,
  }: IFindOneById): Promise<T> {
    try {
      return await this.repo
        .findOne({
          _id: createObjectId(id),
        })
        .select(select(include, exclude))
        .populate(this.convertToPopulateArray(populate))
        .lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_FIND,
      });
    }
  }

  async findOneExcludingId({
    id,
    filter,
    include,
    exclude,
    populate,
  }: IFindOne<T> & { id: string }): Promise<T> {
    try {
      return await this.repo
        .findOne({
          ...filter,
          _id: { $ne: createObjectId(id) },
        })
        .select(select(include, exclude))
        .populate(this.convertToPopulateArray(populate))
        .lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_FIND,
      });
    }
  }

  async findMany({
    filter,
    include,
    exclude,
    limit,
    skip,
    sort,
    populate,
  }: IFindMany<T>): Promise<T[]> {
    try {
      return this.repo
        .find(filter)
        .select(select(include, exclude))
        .populate(this.convertToPopulateArray(populate))
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_FIND,
      });
    }
  }

  async create(props: Partial<T>): Promise<T | any> {
    try {
      return (await this.repo.create(props))['_doc'];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_CREATE,
      });
    }
  }

  async updateOne(
    filter: FilterQuery<T>,
    updatedProps: Partial<T>,
    options?: Record<string, any>,
  ): Promise<T> {
    try {
      return await this.repo.updateOne(filter, updatedProps, options).lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_UPDATE,
      });
    }
  }

  async updateOneById(
    id: string,
    updatedProps: Partial<T>,
    options?: Record<string, any>,
  ): Promise<T> {
    try {
      return await this.repo
        .updateOne({ _id: createObjectId(id) }, updatedProps, options)
        .lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_UPDATE,
      });
    }
  }

  async deleteOne(
    filter: FilterQuery<T>,
    options?: Record<string, any>,
  ): Promise<unknown> {
    try {
      return await this.repo.deleteOne(filter, options).lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_DELETE,
      });
    }
  }

  async deleteOneById(
    id: string,
    options?: Record<string, any>,
  ): Promise<unknown> {
    try {
      return await this.repo
        .deleteOne({ _id: createObjectId(id) }, options)
        .lean();
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERRORCODES.DOCUMENT_FAIL_DELETE,
      });
    }
  }

  private convertToPopulateArray(
    populate: PopulateOptions[],
  ): { path: string; select: string }[] {
    if (!populate?.length) return [];
    return populate.map((g) => {
      return {
        path: g.path,
        select: select(g.include, g.exclude),
      };
    });
  }
}
