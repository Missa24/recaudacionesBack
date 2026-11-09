import { Module } from '@nestjs/common';
import { PersonaJuridicaService } from './persona-juridica.service';
import { PersonaJuridicaController } from './persona-juridica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaJuridica } from './entities/persona-juridica.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonaJuridica, Usuario])],
  controllers: [PersonaJuridicaController],
  providers: [PersonaJuridicaService],
})
export class PersonaJuridicaModule {}
