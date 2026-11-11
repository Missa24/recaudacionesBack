/**
 * Módulo: Seguridad / Asignaciones
 * Archivo: asignaciones-response.interface.ts
 * Descripción:
 *   Contratos compactos compartidos. Los servicios no agregan la envoltura HTTP.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

/** Respuesta individual: no expone estado, fechas ni auditoría. */
export interface MensajeIdResponse {
  message: string;
  id: string;
}
/** Respuesta de operaciones múltiples: IDs de las asignaciones afectadas. */
export interface MensajeIdsResponse {
  message: string;
  ids: string[];
}
/** Permiso disponible dentro de un módulo. */
export interface PermisoCompacto {
  id: string;
  codigo: string;
}
/** Permiso administrativo: identifica la asignación para alta/baja o retiro. */
export interface PermisoAsignado extends PermisoCompacto {
  idAsignacion: string;
  estado: string;
}
/** Módulo con sus respectivos permisos, sin datos de auditoría. */
export interface ModuloCompacto {
  id: string;
  nombres: string;
  permisos: PermisoCompacto[];
}
/** Módulo para administrar las asignaciones de un rol. */
export interface ModuloAsignado {
  id: string;
  nombres: string;
  permisos: PermisoAsignado[];
}
/** Rol y accesos administrativos agrupados por módulo. */
export interface RolConModulos {
  id: string;
  nombre: string;
  modulos: ModuloAsignado[];
}
/** Rol recibido por un usuario. El ID de asignación permite administrarlo. */
export interface RolAsignado {
  id: string;
  nombre: string;
  idAsignacion: string;
  estado: string;
}
/** Usuario resumido con sus roles. */
export interface UsuarioConRoles {
  idUsuario: string;
  username: string;
  roles: RolAsignado[];
}
/** Accesos efectivos: solo registros y relaciones activos/no eliminados. */
export interface UsuarioAccesos {
  idUsuario: string;
  username: string;
  roles: { id: string; nombre: string; modulos: ModuloCompacto[] }[];
}
