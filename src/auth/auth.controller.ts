import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Headers,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiRegister,
  ApiLogin,
  ApiRefreshToken,
  ApiLogout,
  ApiLogoutAll,
  ApiChangePassword,
  ApiProfile,
} from './decorators/swagger.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /*
   * Registro de nuevo usuario
   * POST /auth/register
   */
  @Post('register')
  @ApiRegister()
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
  @UseGuards(LocalAuthGuard)
  @ApiLogin()
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token, refresh_token, expires_in, user } =
      await this.authService.login(req.user);

    // Configura las cookies
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax', // o 'strict' para mayor seguridad
      maxAge: expires_in * 1000, // Tiempo de expiración en milisegundos
      path: '/',
    });

    // Opcional: configurar el refresh token como cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh', // Ruta específica para el refresh
    });

    return {
      message: 'Login exitoso',
      user,
      // No enviamos los tokens en la respuesta
    };
  }

  /*
   * Renovar access token usando refresh token
   * POST /auth/refresh
   */
  @Post('refresh')
  @ApiRefreshToken()
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    // Obtener refresh_token de las cookies en lugar del body
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const { access_token, expires_in } =
      await this.authService.refreshAccessToken(refreshToken);

    // Configurar la nueva cookie de access_token
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in * 1000,
      path: '/',
    });

    return {
      message: 'Token renovado exitosamente',
      expires_in,
    };
  }

  /*
   * Cerrar sesión actual
   * POST /auth/logout
   * Invalida el access token actual y elimina el refresh token
   */
  @Post('logout')
  @ApiLogout()
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    // 1. Limpiar cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // 2. Llamar al servicio para manejar la lógica de logout
    return this.authService.logout(
      req.user.userId,
      req.cookies['access_token'],
    );
  }

  /*
   * Cerrar todas las sesiones del usuario
   * POST /auth/logout-all
   * Útil para cambio de contraseña o seguridad
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiLogoutAll()
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
  @ApiProfile()
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
  @ApiChangePassword()
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) res,
  ) {
    const { token, newPassword, email } = changePasswordDto;
    const response = await this.authService.changePassword(
      token,
      newPassword,
      email,
    );
    const { user, access_token, refresh_token, expires_in } = response;

    // Configura las cookies
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax', // o 'strict' para mayor seguridad
      maxAge: expires_in * 1000, // Tiempo de expiración en milisegundos
      path: '/',
    });

    // Opcional: configurar el refresh token como cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh', // Ruta específica para el refresh
    });

    return {
      message: 'Contraseña cambiada exitosamente',
      user,
    };
  }
}
