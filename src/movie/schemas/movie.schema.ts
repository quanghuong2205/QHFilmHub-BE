import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  slug: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [String], default: [] })
  likers: string[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
