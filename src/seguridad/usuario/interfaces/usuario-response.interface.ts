/**
 * Módulo: Seguridad - Usuario
 * Archivo: usuario-response.interface.ts
 *
 * Descripción:
 * Define las interfaces utilizadas para estructurar
 * las respuestas del módulo Usuario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

/**
 * Interfaz: UsuarioResponse
 *
 * Descripción:
 * Define la estructura de los datos de un usuario
 * que se entregan en las consultas.
 *
 * Incluye los responsables de creación, actualización
 * y eliminación cuando sus relaciones están disponibles.
 */
export interface UsuarioResponse {
  id: string;
  username: string | null;
  email: string;
  ci: string;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  celular: string | null;
  estado: string;
  ultimo_acceso: Date | null;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
  responsable_eliminacion: string | null;
}

/**
 * Interfaz: UsuarioMessageResponse
 *
 * Descripción:
 * Define una respuesta general para las operaciones
 * de creación, actualización y cambio de estado.
 */
export interface UsuarioMessageResponse {
  message: string;
}
