/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv-response.interface.ts
 * Descripción:
 * Define las interfaces utilizadas para estructurar las respuestas
 * del módulo UFV, incluyendo responsables y mensajes de operación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

/**
 * Interfaz: UfvResponse
 * Descripción:
 * Define la estructura de los datos UFV que se entregan en las consultas,
 * incluyendo los responsables de creación y actualización.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface UfvResponse {
  id: string;
  fecha: string;
  valor: string;
  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: UfvSuccessResponse
 * Descripción:
 * Define una respuesta general de operación con indicador de éxito y mensaje.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface UfvMessageResponse {
  message: string;
}
