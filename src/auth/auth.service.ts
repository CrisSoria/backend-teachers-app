import {
  Injectable,
  UnauthorizedException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { IPayload } from './interfaces/payload.interface';
import { Token, TokenDocument } from './schemas/token.schema';
import { ConfigService } from '@nestjs/config';
import { OtpService } from 'src/otp/otp.service';
import { UserStatus } from 'src/users/interfaces/user-status-enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRole } from 'src/users/interfaces/user-role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private configService: ConfigService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  /*
   * Valida las credenciales del usuario (usado por LocalStrategy)
   */
  async validateUser(
    email: string,
    password: string,
    otp?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Validando usuario con email: ${email} | OTP: ${otp}`);

      const user = await this.usersService.validatePassword(email, password);
      this.logger.log(`Password validado exitosamente. Estado: ${user.status}`);

      if (user.status === UserStatus.INACTIVE) {
        throw new UnauthorizedException('Cuenta inactiva');
      }

      // El usuario es nuevo y debe validar su OTP
      if (user.status === UserStatus.UNVERIFIED) {
        if (!otp) {
          throw new UnauthorizedException('OTP es requerido');
        }
        const isValidOTP = await this.otpService.validateOTP(email, otp);
        if (!isValidOTP) {
          throw new UnauthorizedException('OTP inválido');
        }
        // El OTP es válido, actualizamos el estado del usuario
        await this.usersService.update(user._id.toString(), {
          status: UserStatus.ACTIVE,
        });
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error al validar usuario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /*
   * Genera access token y refresh token después de validar el usuario
   */
  async login(user: any) {
    const payload: IPayload = {
      email: user.email,
      sub: user._id,
      name: user.name,
    };

    this.logger.log(`Generando tokens para usuario: ${user.email}`);

    // Access token de corta duración (15 minutos)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Refresh token de larga duración (7 días)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Guardar refresh token en BD
    await this.saveRefreshToken(user._id.toString(), refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutos en segundos
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /*
   * Renueva el access token usando el refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verificar que el refresh token sea válido
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Verificar que el refresh token exista en la BD y no esté en blacklist
      const storedToken = await this.tokenModel.findOne({
        token: refreshToken,
        userId: payload.sub,
        type: 'refresh',
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token inválido o revocado');
      }

      // Verificar que no esté expirado
      if (storedToken.expiresAt < new Date()) {
        await this.tokenModel.deleteOne({ _id: storedToken._id });
        throw new UnauthorizedException('Refresh token expirado');
      }

      // Generar nuevo access token
      const newPayload: IPayload = {
        email: payload.email,
        sub: payload.sub,
        name: payload.name,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      this.logger.log(`Access token renovado para usuario: ${payload.email}`);

      return {
        access_token: accessToken,
        expires_in: 900,
      };
    } catch (error) {
      this.logger.error(`Error al renovar token: ${error.message}`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /*
   * Cierra sesión invalidando el access token y eliminando el refresh token
   */
  async logout(userId: string, accessToken: string) {
    try {
      this.logger.log(`Cerrando sesión para usuario ID: ${userId}`);

      // 1. Eliminar todos los refresh tokens del usuario
      await this.tokenModel.deleteMany({
        userId: userId,
        type: 'refresh',
      });

      // 2. Agregar access token actual a blacklist
      const decoded = await this.jwtService.decode(accessToken);
      if (decoded && typeof decoded === 'object' && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);

        await this.tokenModel.create({
          token: accessToken,
          userId: userId,
          type: 'blacklist',
          expiresAt: expiresAt,
        });
      }

      this.logger.log(`Sesión cerrada exitosamente para usuario ID: ${userId}`);

      return {
        message: 'Sesión cerrada exitosamente',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error al cerrar sesión: ${error.message}`);
      throw error;
    }
  }

  /*
   * Registra un nuevo usuario
   * @param registerUserDto
   * @returns newUser + OTP
   */
  async register(registerUserDto: RegisterUserDto) {
    try {
      this.logger.log(`Registrando nuevo usuario: ${registerUserDto.email}`);
      const user = {
        ...registerUserDto,
        role: UserRole.FREE,
        status: UserStatus.UNVERIFIED,
      };

      const newUser = await this.usersService.create(user);

      this.logger.log(`Usuario registrado exitosamente: ${newUser.email}`);

      // Generar OTP para validación automático después del registro
      const otp = await this.otpService.generateOTP(newUser.email);
      return { newUser, otp };
    } catch (error) {
      this.logger.error(
        `Error al registrar usuario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /*
   * Valida un token JWT y verifica que no esté en blacklist
   */
  async validateToken(token: string) {
    try {
      // Verificar que el token no esté en blacklist
      const blacklisted = await this.tokenModel.findOne({
        token: token,
        type: 'blacklist',
      });

      if (blacklisted) {
        throw new UnauthorizedException('Token invalidado (sesión cerrada)');
      }

      const decoded = await this.jwtService.verifyAsync(token);
      return decoded;
    } catch (error) {
      this.logger.error(`Token inválido: ${error.message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /*
   * Guarda el refresh token en la base de datos
   */
  private async saveRefreshToken(userId: string, refreshToken: string) {
    try {
      const decoded = await this.jwtService.decode(refreshToken);
      if (decoded && typeof decoded === 'object' && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);

        // Opcional: eliminar refresh tokens antiguos del usuario
        await this.tokenModel.deleteMany({
          userId: userId,
          type: 'refresh',
        });

        await this.tokenModel.create({
          token: refreshToken,
          userId: userId,
          type: 'refresh',
          expiresAt: expiresAt,
        });

        this.logger.log(`Refresh token guardado para usuario ID: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error al guardar refresh token: ${error.message}`);
      throw error;
    }
  }

  /*
   * Cierra todas las sesiones del usuario (útil para cambio de contraseña)
   */
  async logoutAllSessions(userId: string) {
    try {
      await this.tokenModel.deleteMany({
        userId: userId,
      });

      this.logger.log(`Todas las sesiones cerradas para usuario ID: ${userId}`);

      return {
        message: 'Todas las sesiones cerradas exitosamente',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error al cerrar todas las sesiones: ${error.message}`);
      throw error;
    }
  }

  /*
   * cambio de contraseña
   */
  async changePassword(token: string, newPassword: string, email: string) {
    try {
      this.logger.log(`Se valida token: ${token}`);
      const isValidOTP = this.otpService.validateOTP(email, token);
      if (!isValidOTP) {
        throw new UnauthorizedException('OTP inválido');
      }
      this.logger.log(`Se actualiza contraseña`);
      const user = await this.usersService.changePassword(email, newPassword);
      this.logger.log(
        `Contraseña cambiada exitosamente para usuario con email: ${email}`,
      );
      this.logger.log(`Se generan nuevos tokens`);
      const { access_token, refresh_token } = await this.login(user);
      return {
        user,
        access_token,
        refresh_token,
      };
    } catch (error) {
      this.logger.error(
        `Error al cambiar la contraseña: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            'Error al cambiar la contraseña de ' + email + ' con OTP ' + token,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
