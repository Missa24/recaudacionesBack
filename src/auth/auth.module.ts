import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiToken } from '../api-tokens/entities/api-token.entity';
import { JwtOrApiTokenGuard } from './guards/jwt-or-api-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTokenGuard } from './guards/api-token.guard';
import { RolesGuard } from './guards/roles.guard';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtOrApiTokenGuard, JwtAuthGuard, ApiTokenGuard, RolesGuard,],
  imports: [
    TypeOrmModule.forFeature([ApiToken]),
    ApiTokensModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1d';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService, JwtOrApiTokenGuard, JwtAuthGuard, ApiTokenGuard, RolesGuard,],
})
export class AuthModule {}
