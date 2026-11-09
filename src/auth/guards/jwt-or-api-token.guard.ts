import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiToken } from '../../api-tokens/entities/api-token.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class JwtOrApiTokenGuard implements CanActivate {
  private readonly logger = new Logger(JwtOrApiTokenGuard.name);

  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
    private readonly jwtAuthGuard: JwtAuthGuard, // ✅ Inyectar, no instanciar
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Token no proporcionado o formato inválido',
      );
    }

    // 🔍 1. Buscar como API Token
    const apiToken = await this.apiTokenRepository.findOne({
      where: { token },      
    });

    if (apiToken) {
      this.logger.log(`🔑 API Token detectado: ${apiToken.id}`);

      // ❌ Validaciones
      if (!apiToken.activo) {
        throw new UnauthorizedException('Token API deshabilitado');
      }

      if (apiToken._deletedAt) {
        throw new UnauthorizedException('Token API eliminado');
      }

      if (
        apiToken.fechaExpiracion &&
        new Date() > new Date(apiToken.fechaExpiracion)
      ) {
        throw new UnauthorizedException('Token API expirado');
      }

      // ✅ Actualizar último uso (sin bloquear)
      this.apiTokenRepository
        .update(apiToken.id, { fechaUltimoUso: new Date() })
        .catch((err) => this.logger.error('Error actualizando uso:', err));

      // ✅ Adjuntar al request
      request.apiToken = apiToken;
      request.sistemaId = apiToken.sistemaId;
      request.user = {
        id: null,
        username: `api-token:${apiToken.id}`,
        tipo: 'API_TOKEN',        
        permisos: apiToken.permisos ?? [],
        roles: [],
      };

      return true;
    }

    // 🔍 2. Fallback a JWT
    this.logger.log('🔐 No es API Token, validando JWT...');
    return this.jwtAuthGuard.canActivate(context) as Promise<boolean>;
  }
}