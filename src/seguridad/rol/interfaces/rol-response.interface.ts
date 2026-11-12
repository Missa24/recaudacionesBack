/**
 * Módulo: Seguridad - Rol
 * Archivo: rol-response.interface.ts
 * Descripción:
 * Define las interfaces utilizadas para estructurar las respuestas
 * del módulo Rol, incluyendo los responsables de auditoría
 * y los mensajes de operación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

/**
 * Interfaz: RolResponse
 * Descripción:
 * Define la estructura de los datos de un rol que se entregan
 * en las consultas del sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export interface RolResponse {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
  responsable_eliminacion: string | null;
}

/**
 * Interfaz: RolMessageResponse
 * Descripción:
 * Define una respuesta general de operación con su respectivo mensaje.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export interface RolMessageResponse {
  message: string;
}
