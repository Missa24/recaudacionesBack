/**
 * Módulo: Catálogo - Requisito
 * Archivo: requisito-response.interface.ts
 * Descripción:
 * Define las estructuras de respuesta para las operaciones
 * del catálogo de requisitos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

/**
 * Respuesta con los datos de un requisito.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface RequisitoResponse {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
  responsable_eliminacion: string | null;
}

/**
 * Respuesta utilizada al registrar un requisito.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface RequisitoCreateResponse {
  message: string;
}

/**
 * Respuesta genérica para operaciones de actualización
 * y cambio de estado.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface RequisitoMessageResponse {
  message: string;
}
