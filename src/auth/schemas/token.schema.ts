import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, index: true })
  token: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 'refresh' })
  type: 'refresh' | 'blacklist';
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Índice TTL para que MongoDB elimine automáticamente tokens expirados
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
