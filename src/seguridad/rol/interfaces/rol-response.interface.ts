/**
 * Contratos de respuesta. La auditoría utiliza nombres claros para el frontend.
 * Desarrollado por: Oscar Canchari.
 */
export interface RolListadoResponse {
  id: string;
  nombre: string;
  codigo: string;
  estado: string;
  responsable_creacion: string;
  fecha_creacion: Date;
}

export interface RolDetalleResponse extends RolListadoResponse {
  descripcion: string | null;
  responsable_actualizacion: string | null;
  fecha_actualizacion: Date;
}

export interface RolCreateResponse {
  message: string;
  id: string;
}

export interface RolEstadoResponse {
  message: string;
  id: string;
  estado: string;
}
