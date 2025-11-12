import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailDto } from 'src/email/dto/email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    return transporter;
  }

  async sendEmail(dto: EmailDto) {
    const { recipients, subject, html } = dto;

    const transport = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipients,
      subject: subject,
      html: html,
    };
    try {
      this.logger.log('Enviando correo electrónico a: ' + dto.recipients);
      await transport.sendMail(options);
      this.logger.log('Correo electrónico enviado exitosamente');
    } catch (error) {
      this.logger.error(
        'Error al enviar correo electrónico: ',
        error.message,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al enviar correo electrónico',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
