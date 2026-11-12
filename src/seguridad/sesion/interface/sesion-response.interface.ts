/**
 * Módulo: Seguridad - Sesión
 * Archivo: sesion-response.interface.ts
 * Descripción:
 * Define las estructuras de respuesta del módulo Sesión.
 */

export interface SesionResponse {
  id: string;
  usuario_id: string;
  username: string | null;
  inicio: Date;
  fin: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface SesionMessageResponse {
  message: string;
}
