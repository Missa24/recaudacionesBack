/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario-response.interface.ts
 * Descripción:
 * Define las interfaces de respuesta utilizadas
 * por el módulo de calendario.
 *
 * Desarrollado por: Missael Apaza
 */

/**
 * Interfaz: CalendarioResponsable
 * Descripción:
 * Define los datos del usuario responsable de una operación.
 *
 * Desarrollado por: Missael Apaza
 */
export interface CalendarioResponsable {
  username: string;
}

/**
 * Interfaz: CalendarioResponse
 * Descripción:
 * Define los datos que se mostrarán al consultar
 * un registro del calendario.
 *
 * Desarrollado por: Missael Apaza
 */
export interface CalendarioResponse {
  id: string;
  fecha: string;
  habil: boolean;
  descripcion: string | null;
  estado: string;
  responsable_creacion: CalendarioResponsable | null;
  responsable_actualizacion: CalendarioResponsable | null;
}

/**
 * Interfaz: CalendarioMessageResponse
 * Descripción:
 * Define una respuesta que contiene un mensaje.
 *
 * Desarrollado por: Missael Apaza
 */
export interface CalendarioMessageResponse {
  message: string;
}

/**
 * Interfaz: CalendarioCreateResponse
 * Descripción:
 * Define la respuesta del registro de una fecha.
 *
 * Desarrollado por: Missael Apaza
 */
export interface CalendarioCreateResponse extends CalendarioMessageResponse {
  id: string;
}

/**
 * Interfaz: CalendarioLoteResponse
 * Descripción:
 * Define la respuesta del registro de múltiples fechas.
 *
 * Desarrollado por: Missael Apaza
 */
export interface CalendarioLoteResponse extends CalendarioMessageResponse {
  total: number;
  ids: string[];
}

/**
 * Interfaz: CalendarioFechaResponse
 * Descripción:
 * Define la respuesta de la consulta de una fecha,
 * incluyendo si su condición proviene de una configuración
 * almacenada o del cálculo del día de la semana.
 *
 * Desarrollado por: Missael Apaza
 */
export interface CalendarioFechaResponse {
  fecha: string;
  habil: boolean;
  configurada: boolean;
  origen: 'CONFIGURACION' | 'DIA_SEMANA';
  registro: CalendarioResponse | null;
}
