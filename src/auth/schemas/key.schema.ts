import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type KeyDocument = HydratedDocument<Key>;

@Schema({ timestamps: true })
export class Key {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  refresh_token: string;
}

export const KeySchema = SchemaFactory.createForClass(Key);
