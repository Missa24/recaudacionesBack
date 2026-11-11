import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "../usuario/entities/usuario.entity";
import { Rol } from "../rol/entities/rol.entity";
import { Modulo } from "../modulo/entities/modulo.entity";
import { Permiso } from "../permiso/entities/permiso.entity";
import { UsuarioRol } from "../usuario-rol/entities/usuario-rol.entity";
import { RolModuloPermiso } from "../rol-modulo-permiso/entities/rol-modulo-permiso.entity";
import { UsuarioRolController } from "./usuario-rol.controller";
import { UsuarioRolService } from "./usuario-rol.service";

/**
 * Módulo: Seguridad / UsuarioRol
 * Archivo: usuario-rol.module.ts
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
  controllers: [UsuarioRolController],
  providers: [UsuarioRolService],
  exports: [UsuarioRolService],
})
export class UsuarioRolModule {}
