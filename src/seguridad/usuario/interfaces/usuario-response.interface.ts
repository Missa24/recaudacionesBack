/**
 * Módulo: Seguridad / Usuario
 * Archivo: usuario-response.interface.ts
 *
 * Descripción:
 * Define las estructuras de respuesta del módulo Usuario.
 * Los nombres de auditoría son claros para el frontend.
 *
 * Fecha de creación: 2026-11-10
 * Autor: Oscar Canchari
 */

/**
 * Respuesta resumida para el listado de usuarios.
 * Solo incluye datos importantes y auditoría de creación.
 */
export interface UsuarioListadoResponse {
  /** UUID del usuario. */
  idUsuario: string;

  /** Nombre de usuario. */
  username: string;

  /** Nombres de la persona. */
  nombres: string;

  /** Apellido paterno. */
  apellido_paterno: string;

  /** Apellido materno. */
  apellido_materno: string | null;

  /** Carnet de identidad. */
  ci: string;

  /** Correo electrónico. */
  email: string;

  /** Estado ACTIVO o INACTIVO. */
  estado: string;

  /** UUID del responsable de registrar al usuario. */
  responsable_creacion: string | null;

  /** Fecha y hora de creación. */
  fecha_creacion: Date | null;
}

/**
 * Respuesta completa de un usuario.
 * Incluye datos personales y auditoría.
 */
export interface UsuarioDetalleResponse extends UsuarioListadoResponse {
  /** Número de celular. */
  celular: string | null;

  /** Último acceso registrado. */
  ultimo_acceso: Date | null;

  /** UUID del responsable de la última modificación. */
  responsable_actualizacion: string | null;

  /** Fecha y hora de la última modificación. */
  fecha_actualizacion: Date | null;
}

/**
 * Respuesta después de crear un usuario.
 */
export interface UsuarioCreateResponse {
  /** Mensaje de confirmación. */
  message: string;

  /** UUID del usuario creado. */
}

/**
 * Respuesta después de dar de alta o baja.
 */
export interface UsuarioEstadoResponse {
  /** Mensaje de confirmación. */
  message: string;

  /** UUID del usuario actualizado. */
  idUsuario: string;
}
