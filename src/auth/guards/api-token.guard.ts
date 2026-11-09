import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTokensService } from '../../api-tokens/api-tokens.service';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  private readonly logger = new Logger(ApiTokenGuard.name);

  constructor(private apiTokensService: ApiTokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      const apiToken = await this.apiTokensService.validateToken(token);

      this.apiTokensService
        .updateLastUsage(apiToken.id)
        .catch((err) =>
          this.logger.error('Error actualizando último uso:', err),
        );

      request.apiToken = {
        id: apiToken.id,
        permisos: apiToken.permisos ?? [],
      };

      request.sistemaId = apiToken.sistemaId;

      request.user = {
        id: null,
        username: `api-token:${apiToken.id}`,
        tipo: 'API_TOKEN',
        permisos: apiToken.permisos ?? [],
        roles: [],
      };

      this.logger.log(`✅ API Token válido: ${apiToken.id}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error validando token API: ${error.message}`);
      throw new UnauthorizedException('Token API inválido');
    }
  }
}