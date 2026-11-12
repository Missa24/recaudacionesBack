/**
 * Módulo: Seguridad - Permiso
 * Archivo: permiso-response.interface.ts
 * Descripción:
 * Define las estructuras de respuesta del módulo Permiso.
 */

export interface PermisoResponse {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface PermisoMessageResponse {
  message: string;
}
