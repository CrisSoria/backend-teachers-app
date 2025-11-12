import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /*
   * Registro de nuevo usuario
   * POST /auth/register
   */
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          example: 'Password123!',
        },
        name: {
          type: 'string',
          example: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Email ya registrado' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { newUser, otp } = await this.authService.register(registerUserDto);
    return {
      message:
        'Usuario registrado exitosamente. Se ha enviado el código para verificar la cuenta al email: ' +
        newUser.email,
      newUser,
      otp,
    };
  }

  /*
   * Login de usuario
   * POST /auth/login
   * Retorna access_token y refresh_token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        otp: {
          type: 'string',
          description: 'Required only for UNVERIFIED users',
          example: '123456',
          required: ['false'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: 900,
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    const { access_token, refresh_token, expires_in, user } =
      await this.authService.login(req.user);
    return {
      message: 'Login exitoso',
      access_token,
      refresh_token,
      expires_in,
      user,
    };
  }

  /*
   * Renovar access token usando refresh token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: 900,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refresh(@Body('refresh_token') refreshToken: string) {
    const { access_token, expires_in } =
      await this.authService.refreshAccessToken(refreshToken);
    return {
      message: 'Token renovado exitosamente',
      access_token,
      expires_in,
    };
  }

  /*
   * Cerrar sesión actual
   * POST /auth/logout
   * Invalida el access token actual y elimina el refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Sesión cerrada exitosamente',
        success: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req, @Headers('authorization') authHeader: string) {
    // Extraer el token del header "Bearer <token>"
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return {
        message: 'Token no proporcionado',
        success: false,
      };
    }
    // logout ya retorna un objeto con message y success
    return this.authService.logout(req.user.userId, token);
  }

  /*
   * Cerrar todas las sesiones del usuario
   * POST /auth/logout-all
   * Útil para cambio de contraseña o seguridad
   */
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar todas las sesiones del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Todas las sesiones cerradas exitosamente',
    schema: {
      example: {
        message: 'Todas las sesiones cerradas exitosamente',
        success: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Request() req) {
    // logoutAll retorna un objeto con message y success
    return this.authService.logoutAllSessions(req.user.userId);
  }

  /*
   * Obtener perfil del usuario autenticado
   * GET /auth/profile
   */
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }

  /*
   * Cambio de contraseña
   * POST /auth/change-password
   * @params
   *    token OTP generado previamente
   *    newPassword
   *    email del usuario que solicita el cambio
   * Retorna el usuario y los tokens
   */
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambio de contraseña' })
  @ApiResponse({ status: 200, description: 'Cambio de contraseña exitoso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const { token, newPassword, email } = changePasswordDto;
    const response = await this.authService.changePassword(
      token,
      newPassword,
      email,
    );
    const { user, access_token, refresh_token } = response;
    return {
      message: 'Contraseña cambiada exitosamente',
      user,
      access_token,
      refresh_token,
    };
  }
}
