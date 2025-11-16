import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Headers,
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
  @ApiRefreshToken()
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
  @ApiLogout()
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
  @ApiBearerAuth()
  @ApiChangePassword()
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
