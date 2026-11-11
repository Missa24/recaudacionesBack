import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "../usuario/entities/usuario.entity";
import { Rol } from "../rol/entities/rol.entity";
import { Modulo } from "../modulo/entities/modulo.entity";
import { Permiso } from "../permiso/entities/permiso.entity";
import { UsuarioRol } from "../usuario-rol/entities/usuario-rol.entity";
import { RolModuloPermiso } from "../rol-modulo-permiso/entities/rol-modulo-permiso.entity";
import { RolModuloPermisoController } from "./rol-modulo-permiso.controller";
import { RolModuloPermisoService } from "./rol-modulo-permiso.service";

/**
 * Módulo: Seguridad / RolModuloPermiso
 * Archivo: rol-modulo-permiso.module.ts
 * Descripción:
 *   Registra las entidades consultadas y exporta su servicio, sin dependencias circulares.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      Modulo,
      Permiso,
      UsuarioRol,
      RolModuloPermiso,
    ]),
  ],
  controllers: [RolModuloPermisoController],
  providers: [RolModuloPermisoService],
  exports: [RolModuloPermisoService],
})
export class RolModuloPermisoModule {}
