import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/email.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiSendEmail } from './decorators/swagger.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiSendEmail()
  async sendMail(@Body() dto: EmailDto) {
    await this.emailService.sendEmail(dto);
    return { message: 'Email enviado correctamente' };
  }
}
