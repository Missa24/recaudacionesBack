/**
 * Módulo: Seguridad - RolModuloPermiso
 * Archivo: map-response-rol-modulo-permiso.util.ts
 *
 * Descripción:
 * Transforma las entidades de roles, módulos y permisos
 * en estructuras de respuesta para el frontend.
 */

import type { Permiso } from 'src/seguridad/permiso/entities/permiso.entity';
import type { Modulo } from 'src/seguridad/modulo/entities/modulo.entity';
import type { Rol } from 'src/seguridad/rol/entities/rol.entity';

import type { RolModuloPermiso } from '../entities/rol-modulo-permiso.entity';

import type {
  CatalogoPermisosResponse,
  RolModuloPermisoResponse,
  RolModulosPermisosResponse,
} from '../interface/rol-modulo-permiso-response.interface';

/**
 * Convierte una asignación individual en su respuesta.
 */
export function mapearRespuesta(
  asignacion: RolModuloPermiso,
): RolModuloPermisoResponse {
  return {
    id: asignacion.id,

    rol_id: asignacion.rol_id,
    rol_codigo: asignacion.rol?.codigo ?? '',
    rol_descripcion: asignacion.rol?.descripcion ?? '',

    modulo_id: asignacion.modulo_id,
    modulo_nombre: asignacion.modulo?.nombre ?? '',
    modulo_codigo: asignacion.modulo?.codigo ?? '',
    modulo_ruta: asignacion.modulo?.ruta ?? '',

    permiso_id: asignacion.permiso_id,
    permiso_codigo: asignacion.permiso?.codigo ?? '',
    permiso_descripcion: asignacion.permiso?.descripcion ?? '',

    estado: asignacion.estado,

    responsable_creacion: asignacion.usuario_creador?.username ?? null,

    responsable_actualizacion:
      asignacion.usuario_actualizador?.username ?? null,
  };
}

/**
 * Convierte una colección de asignaciones en una respuesta
 * agrupada por módulo.
 *
 * Un módulo puede contener varios permisos.
 *
 * @param asignaciones Asignaciones activas del rol.
 * @param rol Rol al que pertenecen las asignaciones (opcional).
 *            Si se omite, se infiere desde la primera asignación.
 */
export function mapearRolModulosPermisos(
  asignaciones: RolModuloPermiso[],
  rol?: Rol,
): RolModulosPermisosResponse {
  const modulosMap = new Map<
    string,
    RolModulosPermisosResponse['modulos'][number]
  >();

  for (const asignacion of asignaciones) {
    const modulo = asignacion.modulo;
    const permiso = asignacion.permiso;

    if (!modulo || !permiso) {
      continue;
    }

    if (!modulosMap.has(modulo.id)) {
      modulosMap.set(modulo.id, {
        id: modulo.id,
        nombre: modulo.nombre,
        codigo: modulo.codigo,
        ruta: modulo.ruta,
        permisos: [],
      });
    }

    const moduloResponse = modulosMap.get(modulo.id)!;

    const permisoExiste = moduloResponse.permisos.some(
      (registro) => registro.id === permiso.id,
    );

    if (!permisoExiste) {
      moduloResponse.permisos.push({
        id: permiso.id,
        codigo: permiso.codigo,
        descripcion: permiso.descripcion,
      });
    }
  }

  const rolBase = rol ?? asignaciones[0]?.rol;

  if (!rolBase) {
    throw new Error(
      'No se puede construir la respuesta de módulos y permisos: no se recibió un rol ni asignaciones con rol asociado',
    );
  }

  return {
    rol: {
      id: rolBase.id,
      codigo: rolBase.codigo,
      descripcion: rolBase.descripcion,
    },
    modulos: Array.from(modulosMap.values()),
  };
}

/**
 * Construye el catálogo de módulos y permisos disponibles.
 */
export function mapearCatalogoPermisos(
  modulos: Modulo[],
  permisos: Permiso[],
): CatalogoPermisosResponse {
  return {
    modulos: modulos.map((modulo) => ({
      id: modulo.id,
      nombre: modulo.nombre,
      codigo: modulo.codigo,
      ruta: modulo.ruta,
    })),

    permisos: permisos.map((permiso) => ({
      id: permiso.id,
      codigo: permiso.codigo,
      descripcion: permiso.descripcion,
    })),
  };
}
