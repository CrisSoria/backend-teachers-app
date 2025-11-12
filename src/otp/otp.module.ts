import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [OtpController],
  providers: [OtpService],
  imports: [
    EmailModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  exports: [OtpService],
})
export class OtpModule {}
