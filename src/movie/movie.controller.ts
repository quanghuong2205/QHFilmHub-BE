import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { AuthInfor } from 'src/decorators/auth-infor.deco';
import { ITokenPayload } from 'src/auth/token-payload.interface';

@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get('/random')
  async getRandomMovie(@AuthInfor() auth: ITokenPayload) {
    return await this.movieService.getRandomMovie(auth._id);
  }

  @Get('/search')
  async searchMovies(
    @Query('query') query: string,
    @Query('limit') limit: string,
  ) {
    console.log('hello');
    return await this.movieService.searchMovies(query, +limit);
  }

  @Get('/top')
  async getTopMovies(
    @Query('limit') limit: string,
    @AuthInfor() auth: ITokenPayload,
  ) {
    return await this.movieService.getTopMovies(+limit, auth._id);
  }

  @Get('/favourite')
  async getFavouriteMovies(@AuthInfor() auth: ITokenPayload) {
    return await this.movieService.getFavouriteMovies(auth._id);
  }

  @Get('/recent')
  async getRecentMovies(@AuthInfor() auth: ITokenPayload) {
    return await this.movieService.getRecentMovies(auth._id);
  }

  @Get('/:type')
  async getMoviesByType(
    @Param('type') type: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @AuthInfor() auth: ITokenPayload,
  ) {
    return await this.movieService.getMoviesByType(
      type,
      +page,
      +limit,
      auth._id,
    );
  }

  @Get('/detail/:slug')
  async getMovieDetail(
    @Param('slug') slug: string,
    @AuthInfor() auth: ITokenPayload,
  ) {
    return await this.movieService.getMovieDetail(slug, auth._id);
  }

  @Get('/link/:slug')
  async getMovieLink(
    @Param('slug') slug: string,
    @Query('episode-slug') episodeSlug: string,
  ) {
    return await this.movieService.getMovieLink(slug, episodeSlug);
  }

  @Post('/like/:slug')
  async likeMovie(
    @Param('slug') slug: string,
    @AuthInfor() auth: ITokenPayload,
  ) {
    return await this.movieService.likeMovie(auth._id, slug);
  }

  @Delete('/unlike/:slug')
  async unlikeMovie(
    @Param('slug') slug: string,
    @AuthInfor() auth: ITokenPayload,
  ) {
    return await this.movieService.unlikeMovie(auth._id, slug);
  }

  @Patch('/view/:slug')
  async upView(@Param('slug') slug: string, @AuthInfor() auth: ITokenPayload) {
    await this.movieService.upView(slug, auth._id);
    return {
      slug,
    };
  }
}
