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
import { PermisoModule } from './seguridad/permiso/permiso.module';
import { ModuloModule } from './seguridad/modulo/modulo.module';
import { UsuarioRolModule } from './seguridad/usuario-rol/usuario-rol.module';
import { AuthModule } from './auth/auth.module';
import { ApiTokensModule } from './api-tokens/api-tokens.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BancoModule } from './catalogo/banco/banco.module';
import { TarifaModule } from './arancel/tarifa/tarifa.module';
import { RequisitoModule as ArancelRequisitoModule } from './arancel/requisito/requisito.module';
import { TipoTramiteCatalogoModule } from './arancel/tipo-tramite-catalogo/tipo-tramite-catalogo.module';
import { ArancelGeneralModule } from './arancel/arancel-general/arancel-general.module';
import { ArancelDetalleModule } from './arancel/arancel-detalle/arancel-detalle.module';
import { ArancelRangoModule } from './arancel/arancel-rango/arancel-rango.module';
import { EventoTramiteModule } from './tramite-vut/evento-tramite/evento-tramite.module';
import { EntregaTramiteModule } from './tramite-vut/entrega-tramite/entrega-tramite.module';
import { CorrelativoAnualModule } from './tramite-vut/correlativo-anual/correlativo-anual.module';
import { CotizacionDetalleModule } from './tramite-vut/cotizacion-detalle/cotizacion-detalle.module';
import { LiquidicacionDetalleModule } from './tramite-vut/liquidicacion-detalle/liquidicacion-detalle.module';
import { RequisitoEntregadoModule } from './tramite-vut/requisito-entregado/requisito-entregado.module';
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
    RolModule,
    PermisoModule,
    ModuloModule,
    UsuarioRolModule,
    AuthModule,
    ApiTokensModule,
    BitacoraModule,
    HttpModule,
    BancoModule,
    TarifaModule,
    ArancelRequisitoModule,
    TipoTramiteCatalogoModule,
    ArancelGeneralModule,
    ArancelDetalleModule,
    ArancelRangoModule,
    EventoTramiteModule,
    EntregaTramiteModule,
    CorrelativoAnualModule,
    CotizacionDetalleModule,
    LiquidicacionDetalleModule,
    RequisitoEntregadoModule,
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
