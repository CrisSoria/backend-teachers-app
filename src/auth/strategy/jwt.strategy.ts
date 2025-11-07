import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPayload } from '../interfaces/payload.interface';
import { Token, TokenDocument } from '../schemas/token.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      // Pasar el request completo para acceder al token
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: IPayload) {
    // Extraer el token del header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // Verificar que el token no esté en blacklist
    const blacklisted = await this.tokenModel.findOne({
      token: token,
      type: 'blacklist',
    });

    if (blacklisted) {
      throw new UnauthorizedException('Token invalidado (sesión cerrada)');
    }

    // Retornar estructura que se usará en req.user
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
