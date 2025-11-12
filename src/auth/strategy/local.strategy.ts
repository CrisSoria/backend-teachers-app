import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // IMPORTANTE: Usar 'email' porque mi DTO usa email, no username
      passwordField: 'password',
      passReqToCallback: true, // Permite acceder al request en validate para obtener el OTP
    });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const otp = req.body?.otp; // Get OTP from request body
    const user = await this.authService.validateUser(email, password, otp);

    return user;
  }
}
