import { Rol } from '../../rol/entities/rol.entity';
import { RolModuloPermiso } from '../entities/rol-modulo-permiso.entity';
import type { ModuloAsignado, RolConModulos } from '../interfaces/rol-modulo-permiso-response.interface';

/**
 * Archivo: map-response-rol-modulo-permiso.util.ts
 * Descripción: Agrupa módulos y permisos e incluye la PK de cada combinación.
 * Fecha: 2026-11-11
 * Autor: Oscar Canchari
 */
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
