import { Module } from '@nestjs/common';
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

@Module({
  imports: [UfvModule, RequisitoModule, PersonaNaturalModule, PersonaJuridicaModule, InteresModule, CalendarioModule, CuentaBancariaModule, DependenciaModule, UsuarioModule, RolModule, UsuarioRolModule, SesionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
