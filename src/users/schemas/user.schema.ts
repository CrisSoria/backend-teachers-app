import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document<Types.ObjectId>;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
