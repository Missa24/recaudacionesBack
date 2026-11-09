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
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
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

    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
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
