import {
  BaseRepository,
  IFindMany,
  IFindOne,
  IFindOneById,
} from './repository.base';
import aqp from 'api-query-params';
import { FilterQuery, Types } from 'mongoose';
import { createObjectId } from 'src/utils/mongoose/createObjectId';

export class BaseCRUDService<R, C, U> {
  private repository: BaseRepository<R>;
  private name: string;

  constructor(repository: BaseRepository<R>, name: string) {
    this.repository = repository;
    this.name = name;
  }

  async findOne({
    filter,
    include,
    exclude,
    populate,
  }: IFindOne<R>): Promise<R> {
    return await this.repository.findOne({
      filter,
      include,
      exclude,
      populate,
    });
  }

  async findOneById({
    id,
    include,
    exclude,
    populate,
  }: IFindOneById): Promise<R> {
    return await this.repository.findOneById({
      id,
      include,
      exclude,
      populate,
    } as any);
  }

  async findMany({
    query,
    include,
    exclude,
    limit,
    page,
    populate,
  }: IFindMany<R> & { query: string; page: number }): Promise<R[]> {
    /* Parse query string to object */
    const parsedQuery = aqp(query);
    delete parsedQuery.filter['page'];
    delete parsedQuery.filter['limit'];

    /* Default page infor */
    const defaultLimit = limit ?? 50;
    const defaultPage = page ?? 1;

    /* Get document range */
    const skip = (defaultPage - 1) * defaultLimit;

    /* Sort condition */
    const sortBy: Record<string, any> = parsedQuery.sort;

    /* Query documents */
    return await this.repository.findMany({
      filter: parsedQuery?.filter ?? {},
      include,
      exclude,
      limit: defaultLimit,
      skip,
      populate,
      sort: sortBy,
    });
  }

  async create(props: C): Promise<R> {
    return await this.repository.create({
      _id: new Types.ObjectId(),
      ...props,
    } as any);
  }

  async updateOne(
    filter: FilterQuery<R>,
    updatedProps: U,
    options?: Record<string, any>,
  ): Promise<any> {
    return await this.repository.updateOne(
      filter,
      updatedProps as any,
      options,
    );
  }

  async updateOneById(
    id: string,
    updatedProps: U,
    options?: Record<string, any>,
  ): Promise<any> {
    return await this.repository.updateOne(
      { _id: createObjectId(id) },
      updatedProps as any,
      options,
    );
  }

  async softDelete(
    filter: FilterQuery<R>,
    updatedProps: Record<string, any>,
    options?: Record<string, any>,
  ) {
    return await this.repository.updateOne(
      filter,
      {
        is_deleted: true,
        ...updatedProps,
      } as any,
      options,
    );
  }

  async softDeleteById(
    id: string,
    updatedProps?: Record<string, any>,
    options?: Record<string, any>,
  ) {
    return await this.repository.updateOne(
      { _id: createObjectId(id) },
      {
        is_deleted: true,
        ...updatedProps,
      } as any,
      options,
    );
  }
}
