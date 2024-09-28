import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { UserModule } from 'src/user/user.module';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieRepository } from './repositories/movie.repo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    UserModule,
  ],
  providers: [MovieService, MovieRepository],
  controllers: [MovieController],
})
export class MovieModule {}
