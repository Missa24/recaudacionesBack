/** Datos mínimos de un permiso en los accesos de un usuario. */
export interface PermisoCompacto {
  id: string;
  codigo: string;
}

/** Módulo con sus permisos efectivos. Contrato local de Usuario Rol. */
export interface ModuloCompacto {
  id: string;
  nombres: string;
  permisos: PermisoCompacto[];
}


/**
 * Archivo: usuario-rol-response.interface.ts
 * Descripción: Respuestas de roles y accesos de un usuario.
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

/** idAsignacion es la PK de la fila de seguridad.usuario_rol. */
export interface RolAsignado {
  id: string;
  nombre: string;
  idAsignacion: string;
  estado: string;
}

/** Usuario resumido con sus roles administrativos. */
export interface UsuarioConRoles {
  idUsuario: string;
  username: string;
  roles: RolAsignado[];
}

/** Accesos efectivos: el servicio filtra relaciones y registros activos/no eliminados. */
export interface UsuarioAccesos {
  idUsuario: string;
  username: string;
  roles: {
    id: string;
    nombre: string;
    modulos: ModuloCompacto[];
  }[];
}
