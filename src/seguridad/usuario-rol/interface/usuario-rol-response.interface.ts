/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: usuario-rol-response.interface.ts
 * Descripción:
 * Define las interfaces utilizadas para estructurar las respuestas
 * del módulo UsuarioRol.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

export interface UsuarioRolResponse {
  id: string;

  usuario_id: string;
  usuario: string | null;

  rol_id: string;
  rol: string | null;
  descripcion_rol: string | null;

  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
  responsable_eliminacion: string | null;
}

/** Respuesta general de una operación. */
export interface UsuarioRolMessageResponse {
  message: string;
}

/** Respuesta con los roles asignados a un usuario. */
export interface UsuarioRolesResponse {
  usuario_id: string;
  roles: {
    id: string;
    codigo: string;
    descripcion: string;
  }[];
}

/** Respuesta con los usuarios asociados a un rol. */
export interface RolUsuariosResponse {
  rol_id: string;
  codigo: string;
  descripcion: string;

  usuarios: {
    id: string;
    username: string;
  }[];
}
