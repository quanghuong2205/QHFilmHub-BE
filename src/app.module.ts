import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { MovieModule } from './movie/movie.module';
import { HttpModule } from '@nestjs/axios';
import { FormatResponseInterceptor } from './interceptors/format-response.interceptor';

@Module({
  imports: [
    /* Env */
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    /* Connect Mongodb */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL', { infer: true }),
      }),
      inject: [ConfigService],
    }),

    /* Http module */
    {
      ...HttpModule.register({ timeout: 10000 }),
      global: true,
    },

    /* Modules */
    AuthModule,
    UserModule,
    MovieModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    HttpModule,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: FormatResponseInterceptor,
    },
  ],
})
export class AppModule {}
