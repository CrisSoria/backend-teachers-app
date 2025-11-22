import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPayload } from '../interfaces/payload.interface';
import { Token, TokenDocument } from '../schemas/token.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { IAuthUser } from '../interfaces/auth-user.interface';
import { UserStatus } from '../../users/interfaces/user-status-enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          console.log('JWT Strategy - Cookies:', req.cookies);
          return req?.cookies?.access_token || null;
        },
      ]),

      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true, // para que el callback tenga acceso al request
    });
  }

  async validate(req: any, payload: IPayload): Promise<IAuthUser> {
    const token = ExtractJwt.fromExtractors([
      (req) => req?.cookies?.access_token || null,
    ])(req);

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

    // Obtener información completa del usuario incluido el rol
    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.status == UserStatus.INACTIVE) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a tu cuenta',
      );
    }

    // Retornar estructura completa que se usará en req.user
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role, // Importante para los guards de autorización
      status: payload.status,
    };
  }
}
