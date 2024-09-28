import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AvatarUrlDto } from './common.dto';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  age?: number;

  @IsOptional()
  address?: string;

  @ValidateNested()
  @Type(() => AvatarUrlDto)
  avatar_url?: AvatarUrlDto;
}
