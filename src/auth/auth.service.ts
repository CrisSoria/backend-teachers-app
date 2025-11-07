import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales del usuario (usado por LocalStrategy)
   * Retorna el usuario sin contraseña si es válido, null si no
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`Validando usuario con email: ${email}`);
      
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`Usuario no encontrado: ${email}`);
        return null;
      }

      // Comparar contraseña
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password || '',
      );

      if (!isPasswordValid) {
        this.logger.warn(`Contraseña incorrecta para: ${email}`);
        return null;
      }

      this.logger.log(`Usuario validado exitosamente: ${email}`);
      
      // Retornar usuario sin la contraseña
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(
        `Error al validar usuario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Genera el access token JWT después de validar el usuario
   */
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      name: user.name,
    };

    this.logger.log(`Generando token para usuario: ${user.email}`);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Registra un nuevo usuario
   */
  async register(createUserDto: any) {
    try {
      this.logger.log(`Registrando nuevo usuario: ${createUserDto.email}`);
     
      const newUser = await this.usersService.create(createUserDto);

      this.logger.log(`Usuario registrado exitosamente: ${newUser.email}`);

      // Generar token para login automático después del registro
      return this.login(newUser);
    } catch (error) {
      this.logger.error(
        `Error al registrar usuario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Valida y decodifica un token JWT
   */
  async validateToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      return decoded;
    } catch (error) {
      this.logger.error(`Token inválido: ${error.message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}