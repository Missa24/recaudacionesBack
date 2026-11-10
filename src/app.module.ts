import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UfvModule } from './catalogo/ufv/ufv.module';
import { RequisitoModule } from './catalogo/requisito/requisito.module';
import { PersonaNaturalModule } from './catalogo/persona-natural/persona-natural.module';
import { PersonaJuridicaModule } from './catalogo/persona-juridica/persona-juridica.module';
import { InteresModule } from './catalogo/interes/interes.module';
import { CalendarioModule } from './catalogo/calendario/calendario.module';
import { CuentaBancariaModule } from './catalogo/cuenta-bancaria/cuenta-bancaria.module';
import { DependenciaModule } from './catalogo/dependencia/dependencia.module';
import { UsuarioModule } from './seguridad/usuario/usuario.module';
import { RolModule } from './seguridad/rol/rol.module';
import { UsuarioRolModule } from './seguridad/usuario-rol/usuario-rol.module';
import { SesionModule } from './seguridad/sesion/sesion.module';
import { AuthModule } from './auth/auth.module';
import { ApiTokensModule } from './api-tokens/api-tokens.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BancoModule } from './catalogo/banco/banco.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UfvModule,
    RequisitoModule,
    PersonaNaturalModule,
    PersonaJuridicaModule,
    InteresModule,
    CalendarioModule,
    CuentaBancariaModule,
    DependenciaModule,
    UsuarioModule,
    RolModule,
    UsuarioRolModule,
    SesionModule,
    AuthModule,
    ApiTokensModule,
    BitacoraModule,
    HttpModule,
    BancoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
