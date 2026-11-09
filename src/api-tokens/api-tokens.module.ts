import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiTokensController } from './api-tokens.controller';
import { ApiTokensService } from './api-tokens.service';
import { ApiToken } from './entities/api-token.entity';
import { UsuarioModule } from '../seguridad/usuario/usuario.module';

import { BitacoraModule } from '../bitacora/bitacora.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('API_TOKEN_SECRET') || 'api_token_secret',
        signOptions: { expiresIn: configService.get('API_TOKEN_DEFAULT_EXPIRY') || '30d' },
      }),
      inject: [ConfigService],
    }),
    UsuarioModule,
    BitacoraModule,
  ],
  controllers: [ApiTokensController],
  providers: [ApiTokensService],
  exports: [ApiTokensService],
})
export class ApiTokensModule {}