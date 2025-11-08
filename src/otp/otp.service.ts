import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private emailService: EmailService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  async generateOTP(email: string): Promise<Otp> {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    // Encriptar el token
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    try {
      this.logger.log(`Intentando crear OTP para email: ${email}`);

      // crea o actualiza el OTP
      const savedOtp = await this.otpModel.findOneAndUpdate(
        { email }, // Busca el OTP por email
        { token: hashedToken, expiresAt }, // Actualiza el token y la fecha de expiración
        { new: true, upsert: true }, // Devuelve el nuevo OTP y crea uno si no existe
      );
      this.logger.log(`OTP creado exitosamente con ID: ${savedOtp._id}`);

      // enviar el token al email
      await this.emailService.sendEmail({
        recipients: [email],
        subject: 'Código de verificación',
        html: `<p>Tu código de verificación es: ${token}</p>`,
      });
      return savedOtp; //TODO: revisar si es necesario enviar el OTP como respuesta
    } catch (error) {
      this.logger.error(`Error al crear OTP: ${error.message}`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al crear el OTP',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateOTP(email: string, token: string): Promise<boolean> {
    this.logger.log(`Validando OTP: ${token} para email: ${email}`);
    const otp = await this.otpModel.findOne({ email });
    if (!otp) {
      this.logger.warn(`OTP no encontrado para email: ${email}`);
      return false;
    }
    if (otp.expiresAt < new Date()) {
      this.logger.warn(`OTP expirado`);
      return false;
    }
    const isValidOTP = await bcrypt.compare(token, otp.token);
    this.logger.log(`OTP is valid: ${isValidOTP}`);
    return isValidOTP;
  }

  //TODO: implementar o eliminar
  findOne(id: number) {
    return `This action returns a #${id} otp`;
  }

  //TODO: implementar o eliminar
  remove(id: number) {
    return `This action removes a #${id} otp`;
  }
}
