/**
 * Contratos de respuesta. La auditoría utiliza nombres claros para el frontend.
 * Desarrollado por: Oscar Canchari.
 */
export interface PermisoListadoResponse {
  id: string;
  nombre: string;
  codigo: string;
  estado: string;
  responsable_creacion: string;
  fecha_creacion: Date;
}

export interface PermisoDetalleResponse extends PermisoListadoResponse {
  descripcion: string | null;
  responsable_actualizacion: string | null;
  fecha_actualizacion: Date;
}

export interface PermisoCreateResponse {
  message: string;
  id: string;
}

export interface PermisoEstadoResponse {
  message: string;
  id: string;
  estado: string;
}
