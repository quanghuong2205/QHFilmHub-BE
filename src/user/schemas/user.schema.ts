import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';
import { validateEmail } from 'src/utils/mongoose/validators';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class Avatar {
  @Prop({ required: true })
  public_id: string;

  @Prop({ required: true })
  original_url: string;

  resized_url: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    validate: validateEmail,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Role' })
  role: Types.ObjectId;

  @Prop({ min: 0 })
  age: number;

  @Prop()
  address: string;

  @Prop({ type: Avatar, default: () => null })
  avatar_url: Avatar;

  @Prop([String])
  recent_movies: [];

  @Prop([String])
  favourite_movies: [];

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: false })
  is_verified_email: boolean;

  @Prop({ type: Object })
  created_by: {
    _id: Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updated_by: {
    _id: Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deleted_by: {
    _id: Types.ObjectId;
    email: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
