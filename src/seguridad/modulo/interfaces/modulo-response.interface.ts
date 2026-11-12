/**
 * Módulo: Seguridad - Módulo
 * Archivo: modulo-response.interface.ts
 *
 * Define las estructuras de respuesta del módulo.
 */

export interface ModuloResponse {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  ruta: string;
  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ModuloMessageResponse {
  message: string;
}
