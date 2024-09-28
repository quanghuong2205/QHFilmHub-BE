import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Env */
  const configService = app.get(ConfigService);

  const origin = <string>configService.get<string>('ORIGIN');

  app.enableCors({
    origin: [origin],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: false,
    credentials: true,
  });

  /* Middlewares */
  app.use(cookieParser());

  /* Global pipes */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  /* Listen */
  const port = <number>configService.get<number>('PORT', { infer: true });
  await app.listen(port, () => {
    console.log('Server is listening on the port::', port);
  });
}

bootstrap();
