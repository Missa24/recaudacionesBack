/**
 * Interfaz: PersonaNaturalResponse
 * Descripción:
 * Define los datos que se mostrarán al consultar una persona natural.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface PersonaNaturalResponse {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  complemento: string;
  expedido: string;
  nombres: string;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  apellido_casada: string | null;
  domicilio: string | null;
  telefono: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  estado_civil: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/**
 * Interfaz: PersonaNaturalMessageResponse
 * Descripción:
 * Define la respuesta de una operación mediante un mensaje.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface PersonaNaturalMessageResponse {
  message: string;
}

/**
 * Interfaz: PersonaNaturalCreateResponse
 * Descripción:
 * Define los datos devueltos después de registrar una persona natural.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface PersonaNaturalCreateResponse extends PersonaNaturalMessageResponse {
  id: string;
}

/**
 * Interfaz: BuscarPersonaNaturalResponse
 * Descripción:
 * Define el resultado de la búsqueda de personas naturales
 * mediante sus datos documentales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface BuscarPersonaNaturalResponse {
  encontrada: boolean;
  persona: PersonaNaturalResponse[];
}
