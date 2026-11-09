import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || !payload?.username || !Array.isArray(payload.roles)) {
      throw new UnauthorizedException('El token no corresponde a un usuario autenticado');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      name: payload.name,
      email: payload.email,
      roles: payload.roles,
    };
  }
}