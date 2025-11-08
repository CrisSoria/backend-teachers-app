import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  token: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Índice TTL para que MongoDB elimine automáticamente tokens expirados
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });