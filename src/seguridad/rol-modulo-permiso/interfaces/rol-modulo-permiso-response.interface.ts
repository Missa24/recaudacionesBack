/**
 * Archivo: rol-modulo-permiso-response.interface.ts
 * Descripción: Respuestas de módulos y permisos de un rol.
 * Fecha: 2026-11-11
 * Autor: Oscar Canchari
 */

/** Respuesta de una operación individual. */
export interface MensajeIdResponse {
  message: string;
  id: string;
}

/** Respuesta de operaciones múltiples. */
export interface MensajeIdsResponse {
  message: string;
  ids: string[];
}

/** Datos mínimos de un permiso. */
export interface PermisoCompacto {
  id: string;
  codigo: string;
}

/** idAsignacion es la PK de la fila de seguridad.rol_modulo_permiso. */
export interface PermisoAsignado extends PermisoCompacto {
  idAsignacion: string;
  estado: string;
}

/** Módulo con sus permisos efectivos. */
export interface ModuloCompacto {
  id: string;
  nombres: string;
  permisos: PermisoCompacto[];
}

/** Módulo con las asignaciones de permisos para administración. */
export interface ModuloAsignado {
  id: string;
  nombres: string;
  permisos: PermisoAsignado[];
}

/** Rol y accesos agrupados por módulo. */
export interface RolConModulos {
  id: string;
  nombre: string;
  modulos: ModuloAsignado[];
}

/** Contrato alternativo para el listado por fila, si tu servicio ya lo utiliza. */
export interface RolModuloPermisoListadoResponse {
  id: string;
  rol: { id: string; nombre: string };
  modulo: { id: string; nombres: string };
  permiso: { id: string; codigo: string };
  estado: string;
}
