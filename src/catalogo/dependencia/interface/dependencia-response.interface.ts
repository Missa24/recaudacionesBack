/**
 * Interfaz: DependenciaResponse
 * Descripción:
 * Define los datos que se mostrarán al consultar la Dependencia.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface DependenciaResponse {
  id: string;
  codigo: string;
  nombre: string;
  abreviacion: string;
  es_unidad_desconcentrada: boolean;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: DependenciaMessageResponse
 * Descripción:
 * Define la respuesta de una operación mediante un mensaje.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface DependenciaMessageResponse {
  message: string;
}
