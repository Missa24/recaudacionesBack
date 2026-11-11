import { Usuario } from '../../usuario/entities/usuario.entity';
import { Rol } from '../../rol/entities/rol.entity';
import { UsuarioRol } from '../../usuario-rol/entities/usuario-rol.entity';
import { RolModuloPermiso } from '../../rol-modulo-permiso/entities/rol-modulo-permiso.entity';
import {
  ModuloAsignado,
  ModuloCompacto,
  RolConModulos,
  UsuarioAccesos,
  UsuarioConRoles,
} from '../interfaces/asignaciones-response.interface';

/**
 * Módulo: Seguridad / Asignaciones
 * Archivo: map-asignaciones.util.ts
 * Descripción:
 *   Agrupa relaciones sin devolver entidades completas ni datos de auditoría.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

/** Usuario y roles administrativos; incluye ID y estado de cada asignación. */
export function mapUsuarioRoles(
  usuario: Usuario,
  asignaciones: UsuarioRol[],
): UsuarioConRoles {
  return {
    idUsuario: usuario.idUsuario,
    username: usuario.username,
    roles: asignaciones.map((a) => ({
      id: a.rol.id,
      nombre: a.rol.nombre,
      idAsignacion: a.id,
      estado: a.estado,
    })),
  };
}

/** Rol con módulos y permisos administrativos, agrupados sin repetir módulos. */
export function mapRolModulos(
  rol: Rol,
  asignaciones: RolModuloPermiso[],
): RolConModulos {
  const modulos = new Map<string, ModuloAsignado>();
  for (const a of asignaciones) {
    if (!modulos.has(a.idModulo))
      modulos.set(a.idModulo, {
        id: a.modulo.id,
        nombres: a.modulo.nombres,
        permisos: [],
      });
    const modulo = modulos.get(a.idModulo)!;
    if (!modulo.permisos.some((p) => p.id === a.idPermiso))
      modulo.permisos.push({
        id: a.permiso.id,
        codigo: a.permiso.codigo,
        idAsignacion: a.id,
        estado: a.estado,
      });
  }
  return { id: rol.id, nombre: rol.nombre, modulos: [...modulos.values()] };
}

/** Accesos efectivos; recibe únicamente relaciones previamente filtradas como activas. */
export function mapAccesos(
  usuario: Usuario,
  roles: UsuarioRol[],
  accesos: RolModuloPermiso[],
): UsuarioAccesos {
  const rolesUnicos = [...new Map(roles.map((a) => [a.idRol, a])).values()];
  return {
    idUsuario: usuario.idUsuario,
    username: usuario.username,
    roles: rolesUnicos.map((a) => {
      const modulos = new Map<string, ModuloCompacto>();
      for (const acceso of accesos.filter((x) => x.idRol === a.idRol)) {
        if (!modulos.has(acceso.idModulo))
          modulos.set(acceso.idModulo, {
            id: acceso.modulo.id,
            nombres: acceso.modulo.nombres,
            permisos: [],
          });
        const modulo = modulos.get(acceso.idModulo)!;
        if (!modulo.permisos.some((p) => p.id === acceso.idPermiso))
          modulo.permisos.push({
            id: acceso.permiso.id,
            codigo: acceso.permiso.codigo,
          });
      }
      return {
        id: a.rol.id,
        nombre: a.rol.nombre,
        modulos: [...modulos.values()],
      };
    }),
  };
}
