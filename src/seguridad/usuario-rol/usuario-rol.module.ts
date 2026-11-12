import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRolService } from './usuario-rol.service';
import { UsuarioRolController } from './usuario-rol.controller';
import { Rol } from '../rol/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { RolModule } from '../rol/rol.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioRol, Usuario, Rol]),
    UsuarioModule,
    RolModule,
  ],
  controllers: [UsuarioRolController],
  providers: [UsuarioRolService],
})
export class UsuarioRolModule {}
