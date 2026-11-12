import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolModuloPermisoService } from './rol-modulo-permiso.service';
import { RolModuloPermisoController } from './rol-modulo-permiso.controller';
import { Modulo } from '../modulo/entities/modulo.entity';
import { Permiso } from '../permiso/entities/permiso.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { RolModuloPermiso } from './entities/rol-modulo-permiso.entity';
import { PermisoModule } from '../permiso/permiso.module';
import { RolModule } from '../rol/rol.module';
import { ModuloModule } from '../modulo/modulo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolModuloPermiso, Rol, Modulo, Permiso, Usuario]),
    PermisoModule,
    RolModule,
    ModuloModule,
  ],
  controllers: [RolModuloPermisoController],
  providers: [RolModuloPermisoService],
})
export class RolModuloPermisoModule {}
