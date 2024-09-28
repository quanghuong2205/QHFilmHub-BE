import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { MovieRepository } from './repositories/movie.repo';
import { getNumberFromString } from 'src/utils/getNumberFromString';

@Injectable()
export class MovieService {
  constructor(
    private readonly httpService: HttpService,
    private userService: UserService,
    private movieRepo: MovieRepository,
    private configService: ConfigService,
  ) {}

  async getRandomMovie(userId: string) {
    /* Get list of movies */
    const movies: any = (await this.getMoviesByType('phim-le', 1, 20)).movies;

    /* Random movies */
    const totalMovies = movies.length;
    const randomIndex = Math.floor(Math.random() * totalMovies);

    /* Get random movie */
    const movie = movies[randomIndex];

    /* Get movie detail */
    const movieDetail = await this.getMovieDetail(movie.slug, userId);
    return movieDetail;
  }

  async getMoviesByType(
    type: string,
    page?: number,
    limit?: number,
    userId?: string,
  ) {
    /* Request movies */
    const url = `${this.configService.get<string>('MOVIE_BY_TYPE_API')}/${type}`;
    const observable = this.httpService
      .get(url, {
        params: {
          page: +page || 1,
          limit: +limit || 10,
        },
      })
      .pipe(
        map((response) => response.data),
        map((data) => data?.data),
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            throw new NotFoundException({
              message: 'Not found the movies',
              code: 404,
            });
          }
          throw error;
        }),
      );

    const result: any = await lastValueFrom(observable);

    /* Get user favourite movies (if provide userId) */
    const favourieMovieSlugs = userId
      ? await this.userService.getFavouriteMovieSlugs(userId)
      : [];

    /* Get movies */
    const baseImageApi = this.configService.get<string>('MOVIE_IMG_BASE_API');
    const movies = result.items.map((movie: any) => {
      const {
        _id,
        name,
        slug,
        thumb_url,
        time,
        type,
        category,
        country,
        year,
        episode_current,
      } = movie;

      /* Format time */
      const totalMinutes = parseInt(time);
      const hours = totalMinutes > 60 ? Math.floor(totalMinutes / 60) : 0;
      const minutes = totalMinutes % 60;

      /* Return */
      return {
        _id,
        name,
        slug,
        type,
        thumb_url: `${baseImageApi}/${thumb_url}`,
        category: category.map((c: any) => c.name),
        country: country.map((c: any) => c.name),
        hours,
        minutes,
        year,
        current_episode: episode_current,
        isFavourite: !!favourieMovieSlugs?.find((s) => s === slug),
      };
    });

    /* Return */
    return {
      movies,
      pagination: result.params.pagination,
    };
  }

  async getMovieDetail(slug: string, userId?: string) {
    /* Request movies */
    const url = `${this.configService.get<string>('MOVIE_DETAIL_API')}/${slug}`;
    const observable = this.httpService
      .get(url)
      .pipe(
        map((response) => response.data),
        map((data) => data?.data?.item),
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            throw new NotFoundException({
              message: 'Not found the movies',
              code: 404,
            });
          }
          throw error;
        }),
      );

    /* Get user favourite movies */
    const favourieMovieSlugs =
      await this.userService.getFavouriteMovieSlugs(userId);

    /* Get movie */
    const movie = await lastValueFrom(observable);
    console.log(movie);
    const {
      _id,
      name,
      content,
      type,
      status,
      poster_url,
      thumb_url,
      trailer_url,
      time,
      year,
      actor,
      director,
      category,
      country,
      episodes,
      episode_current,
      episode_total,
    } = movie;

    /* Format time */
    const totalMinutes = getNumberFromString(time);
    const hours = totalMinutes > 60 ? Math.floor(totalMinutes / 60) : 0;
    const minutes = totalMinutes % 60;

    /* Format Episode */
    const episodeRange = episode_current?.split('/');
    const currentEpisode =
      type === 'series' ? getNumberFromString(episodeRange[0]) : null;

    /* Get views and likes */
    const movieFromDB = await this.movieRepo.getMovie(slug);

    /* Movie type */
    const movieTypes = {
      series: 'phim-bo',
      tvshows: 'tv-shows',
      hoathinh: 'hoat-hinh',
      single: 'phim-le',
    };

    return {
      _id,
      name,
      slug,
      content,
      status,
      poster_url,
      thumb_url,
      trailer_url,
      type: movieTypes[type],
      year,
      actor,
      director,
      category,
      country,
      hours,
      minutes,
      current_episode: currentEpisode,
      episodes: episodes[0].server_data,
      total_episode: type === 'series' ? +episode_total : null,
      views: movieFromDB?.views || 0,
      like_qty: movieFromDB?.likers.length || 0,
      isFavourite: !!favourieMovieSlugs.find((m) => m === slug),
    };
  }

  async getTopMovies(limit: number = 5, userId: string) {
    /* Get top movies  */
    const topMovies = await this.movieRepo.getTopMovies(limit);

    /* Request api to get movie detail */
    return await Promise.all(
      topMovies.map(async (m) => {
        const movieDetail = await this.getMovieDetail(m.slug, userId);
        const {
          _id,
          name,
          slug,
          type,
          thumb_url,
          category,
          country,
          hours,
          minutes,
          year,
          isFavourite,
          current_episode,
        } = movieDetail;
        return {
          _id,
          name,
          slug,
          type,
          thumb_url,
          category: category.map((c: any) => c.name),
          country: country.map((c: any) => c.name),
          hours,
          minutes,
          year,
          isFavourite,
          current_episode,
        };
      }),
    );
  }

  async getMovieLink(movieSlug: string, episodeSlug: string) {
    /* Request movies */
    const url = `${this.configService.get<string>('MOVIE_DETAIL_API')}/${movieSlug}`;
    const observable = this.httpService
      .get(url)
      .pipe(
        map((response) => response.data),
        map((data) => data?.data?.item),
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            throw new NotFoundException({
              message: 'Not found the movies',
              code: 404,
            });
          }
          throw error;
        }),
      );

    /* Get movie */
    const movie = await lastValueFrom(observable);
    const { type, episodes, name } = movie;

    /* Get link */
    const link =
      type === 'single'
        ? episodes[0].server_data[0].link_m3u8
        : episodes[0].server_data.find((e: any) => e.slug === episodeSlug)
            .link_m3u8;

    return {
      link,
      name,
    };
  }

  async searchMovies(query: string, limit?: number) {
    /* Request movies */
    const url = `${this.configService.get<string>('MOVIE_SEARCH_API')}`;
    const observable = this.httpService
      .get(url, { params: { keyword: query, limit: limit || 10 } })
      .pipe(
        map((response) => response.data),
        map((data) => data?.data),
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            throw new NotFoundException({
              message: 'Not found the movies',
              code: 404,
            });
          }
          throw error;
        }),
      );

    const result: any = await lastValueFrom(observable);

    const baseImageApi = this.configService.get<string>('MOVIE_IMG_BASE_API');
    /* Get movies */
    const movies = result.items.map((movie: any) => {
      const { name, slug, poster_url, category } = movie;

      /* Return */
      return {
        name,
        slug,
        poster_url: `${baseImageApi}/${poster_url}`,
        category: category.map((c: any) => c.name),
      };
    });

    /* Return */
    return movies;
  }

  async likeMovie(userId: string, slug: string) {
    /* Validate */
    const isLiked = await this.movieRepo.isLiked(slug, userId);
    if (isLiked) {
      throw new BadRequestException({
        message: 'Has already liked the movie',
        errorCode: '',
      });
    }

    /* Update user favourite movies */
    await this.userService.likeMovie(userId, slug);

    /* Update movie  */
    await this.movieRepo.likeMovie(slug, userId);

    return {
      slug,
    };
  }

  async unlikeMovie(userId: string, slug: string) {
    /* Validate */
    const isLiked = await this.movieRepo.isLiked(slug, userId);
    if (!isLiked) {
      throw new BadRequestException({
        message: 'Has already unliked the movie',
        errorCode: '',
      });
    }

    /* Update user favourite movies */
    await this.userService.unlikeMovie(userId, slug);

    /* Update movie  */
    await this.movieRepo.unlikeMovie(slug, userId);

    return {
      slug,
    };
  }

  async getFavouriteMovies(userId: string) {
    /* Get favourite movie slugs */
    const favourieMovieSlugs =
      await this.userService.getFavouriteMovieSlugs(userId);

    if (!favourieMovieSlugs || !favourieMovieSlugs.length) return [];

    /* Request api to get movie detail */
    return await Promise.all(
      favourieMovieSlugs?.map(async (s) => {
        const movieDetail = await this.getMovieDetail(s, userId);
        const {
          _id,
          name,
          slug,
          type,
          thumb_url,
          category,
          country,
          hours,
          minutes,
          year,
          isFavourite,
          current_episode,
        } = movieDetail;
        return {
          _id,
          name,
          slug,
          type,
          thumb_url,
          category: category.map((c: any) => c.name),
          country: country.map((c: any) => c.name),
          hours,
          minutes,
          year,
          isFavourite,
          current_episode,
        };
      }),
    );
  }

  async getRecentMovies(userId: string) {
    /* Get favourite movie slugs */
    const favourieMovieSlugs =
      await this.userService.getRecentMovieSlugs(userId);

    /* Request api to get movie detail */
    return await Promise.all(
      favourieMovieSlugs.map(async (s) => {
        const movieDetail = await this.getMovieDetail(s, userId);
        const {
          _id,
          name,
          slug,
          type,
          thumb_url,
          category,
          country,
          hours,
          minutes,
          year,
          isFavourite,
          current_episode,
        } = movieDetail;
        return {
          _id,
          name,
          slug,
          type,
          thumb_url,
          category: category.map((c: any) => c.name),
          country: country.map((c: any) => c.name),
          hours,
          minutes,
          year,
          isFavourite,
          current_episode,
        };
      }),
    );
  }

  async upView(slug: string, userId: string) {
    /* Upview */
    await this.movieRepo.upView(slug);

    /* Save recent movie */
    return await this.userService.saveRecentMovieIfNotExisted(slug, userId);
  }
}
