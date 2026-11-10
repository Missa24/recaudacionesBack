/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: cuenta-bancaria-response.interface.ts
 * Descripción:
 * Define las estructuras de respuesta utilizadas
 * por el módulo de cuentas bancarias.
 *
 * Desarrollado por: Missael Apaza
 */

/**
 * Interfaz: CuentaBancariaResponse
 * Define los datos que se mostrarán al consultar
 * una cuenta bancaria.
 */
export interface CuentaBancariaResponse {
  id: string;
  id_banco: string;
  nro_cuenta: string;
  nombre_cuenta: string;
  id_dependencia: string | null;
  tipo: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: CuentaBancariaMessageResponse
 * Define la respuesta de una operación mediante un mensaje.
 */
export interface CuentaBancariaMessageResponse {
  message: string;
}

/**
 * Interfaz: CuentaBancariaCreateResponse
 * Define los datos devueltos después de registrar
 * una cuenta bancaria.
 */
export interface CuentaBancariaCreateResponse extends CuentaBancariaMessageResponse {
  id: string;
}
