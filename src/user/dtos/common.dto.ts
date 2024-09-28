import { IsNotEmpty } from 'class-validator';

export class AvatarUrlDto {
  @IsNotEmpty()
  public_id: string;

  @IsNotEmpty()
  original_url: string;

  resized_url: string;
}
