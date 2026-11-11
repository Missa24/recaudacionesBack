import { Usuario } from '../../usuario/entities/usuario.entity';
import { UsuarioRol } from '../entities/usuario-rol.entity';
import { RolModuloPermiso } from '../../rol-modulo-permiso/entities/rol-modulo-permiso.entity';
import type { ModuloCompacto, UsuarioAccesos, UsuarioConRoles } from '../interfaces/usuario-rol-response.interface';

/**
 * Archivo: map-response-usuario-rol.util.ts
 * Descripción: Mapea usuarios, roles y accesos efectivos sin auditoría.
 * Fecha: 2026-11-11
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
