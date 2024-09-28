import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { Key, KeySchema } from './schemas/key.schema';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { KeyRepository } from './repositories/key.repo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    JwtModule,
    UserModule,
  ],
  providers: [AuthService, KeyRepository],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
