/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: persona-juridica-response.interface.ts
 * Descripción:
 * Define las estructuras de respuesta utilizadas
 * por el módulo de personas jurídicas.
 *
 * Desarrollado por: Missael Apaza
 */

/**
 * Interfaz: PersonaJuridicaResponse
 * Define los datos que se mostrarán al consultar
 * una persona jurídica.
 */
export interface PersonaJuridicaResponse {
  id: string;
  nit: string;
  razon_social: string;
  domicilio: string | null;
  telefono: string | null;
  email: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: PersonaJuridicaMessageResponse
 * Define la respuesta de una operación mediante un mensaje.
 */
export interface PersonaJuridicaMessageResponse {
  message: string;
}

/**
 * Interfaz: PersonaJuridicaCreateResponse
 * Define los datos devueltos después de registrar
 * una persona jurídica.
 */
export interface PersonaJuridicaCreateResponse extends PersonaJuridicaMessageResponse {
  id: string;
}

/**
 * Interfaz: BuscarPersonaJuridicaResponse
 * Define el resultado de la búsqueda de una persona jurídica
 * mediante su NIT único.
 */
export interface BuscarPersonaJuridicaResponse {
  encontrada: boolean;
  persona: PersonaJuridicaResponse | null;
}
