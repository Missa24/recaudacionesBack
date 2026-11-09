import { Module } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { DependenciaController } from './dependencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dependencia, Usuario])],
  controllers: [DependenciaController],
  providers: [DependenciaService],
})
export class DependenciaModule {}
