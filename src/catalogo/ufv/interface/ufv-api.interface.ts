/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv-api.interface.ts
 * Descripción:
 * Define la estructura de la respuesta proporcionada por la API externa
 * utilizada para obtener los valores y fechas de actualización de la UFV.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

/**
 * Interfaz: UfvApiResponse
 * Descripción:
 * Representa la estructura de respuesta de la API externa,
 * incluyendo el estado de la consulta, los datos obtenidos y posibles errores.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface UfvApiResponse {
  ok: boolean;
  datos: {
    usd_bob: number;
    fuente: string;
    fuente_usd: string;
    fecha_corte_usd: string;
    moneda_base: string;
    fuente_ufv: string;
    vigencia_usd: string;
    ufv_bob: number;
    fecha_actualizacion: string;
    url_fuente: string;
    fecha_ufv: string;
  };
  error: string | null;
  timestamp: string;
}
