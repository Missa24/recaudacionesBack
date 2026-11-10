/**
 * Interfaz: BancoResponse
 * Descripción:
 * Define los datos que se mostrarán al consultar el Banco.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface BancoResponse {
  id: string;
  nombre: string;
  codigo_bc: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: BancoMessageResponse
 * Descripción:
 * Define la respuesta de una operación mediante un mensaje.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface BancoMessageResponse {
  message: string;
}
