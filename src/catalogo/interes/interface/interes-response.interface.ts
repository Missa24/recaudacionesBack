/**
 * Módulo: Catálogo - Intereses
 * Archivo: interes-response.interface.ts
 * Descripción:
 * Define las interfaces utilizadas para estructurar las respuestas
 * del módulo de Intereses, incluyendo responsables y mensajes de operación.
 *
 * Desarrollado por: Missael Apaza
 */

/**
 * Interfaz: InteresResponse
 * Descripción:
 * Define la estructura de los datos de intereses que se entregan
 * en las consultas, incluyendo los responsables de creación y actualización.
 *
 * Desarrollado por: Missael Apaza
 */
export interface InteresResponse {
  id: string;
  fecha_publicacion: string;
  valor: string;
  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: InteresMessageResponse
 * Descripción:
 * Define una respuesta general de operación que contiene
 * un mensaje informativo sobre el resultado de la operación.
 *
 * Desarrollado por: Missael Apaza
 */
export interface InteresMessageResponse {
  message: string;
}
