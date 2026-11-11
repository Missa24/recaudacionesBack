/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario-response.interface.ts
 * Descripción:
 * Define las interfaces de respuesta utilizadas
 * por el módulo de calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

/**
 * Interfaz: CalendarioResponse
 * Descripción:
 * Define los datos que se mostrarán al consultar
 * un registro del calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface CalendarioResponse {
  id: string;
  fecha: string;
  dia_habil: boolean;
  descripcion: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: CalendarioMessageResponse
 * Descripción:
 * Define una respuesta que contiene un mensaje.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface CalendarioMessageResponse {
  message: string;
}

/**
 * Interfaz: CalendarioCreateResponse
 * Descripción:
 * Define la respuesta del registro de una fecha.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface CalendarioCreateResponse extends CalendarioMessageResponse {
  id: string;
}

/**
 * Interfaz: CalendarioLoteResponse
 * Descripción:
 * Define la respuesta del registro de múltiples fechas.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface CalendarioLoteResponse {
  message: string;
  total: number;
  fechas_omitidas?: string[]; // ← fechas que ya existían y no se insertaron
}

/**
 * Interfaz: CalendarioFechaResponse
 * Descripción:
 * Define la respuesta de la consulta de una fecha,
 * incluyendo si su condición proviene de una configuración
 * almacenada o del cálculo del día de la semana.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface CalendarioFechaResponse {
  fecha: string;
  dia_habil: boolean;
  configurada: boolean;
  origen: 'CONFIGURACION' | 'DIA_SEMANA';
  registro: CalendarioResponse | null;
}
