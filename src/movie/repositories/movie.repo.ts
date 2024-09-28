import { BaseRepository } from 'src/core/base/repository.base';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Movie } from '../schemas/movie.schema';

@Injectable()
export class MovieRepository extends BaseRepository<Movie> {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {
    super(movieModel);
  }

  async likeMovie(slug: string, userId: string) {
    await this.repo.findOneAndUpdate(
      {
        slug,
      },
      {
        $push: { likers: userId },
        $pull: { dislikers: userId },
      },
      {
        upsert: true,
      },
    );
  }

  async unlikeMovie(slug: string, userId: string) {
    return await this.repo.findOneAndUpdate(
      {
        slug,
      },
      {
        $pull: { likers: userId },
      },
    );
  }

  async isLiked(slug: string, userId: string) {
    return await this.repo.findOne({ slug, likers: { $in: [userId] } });
  }

  async upView(slug: string) {
    return await this.repo.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { upsert: true },
    );
  }

  async getTopMovies(top: number): Promise<{ slug: string; _id: string }[]> {
    return await this.repo.find().sort({ views: -1 }).limit(top).select('slug');
  }

  async getMovie(slug: string): Promise<any> {
    return await this.findOne({
      filter: { slug },
    });
  }
}
