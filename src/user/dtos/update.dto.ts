import { IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { AvatarUrlDto } from './common.dto';
import { Type } from 'class-transformer';

export class UpdateUserDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsPositive()
  age?: number;

  @IsOptional()
  address?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarUrlDto)
  avatar_url?: AvatarUrlDto;
}
