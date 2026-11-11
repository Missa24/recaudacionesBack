/**
 * Contratos de respuesta. La auditoría utiliza nombres claros para el frontend.
 * Desarrollado por: Oscar Canchari.
 */
export interface ModuloListadoResponse {
  id: string;
  nombres: string;
  codigo: string;
  estado: string;
  responsable_creacion: string;
  fecha_creacion: Date;
}

export interface ModuloDetalleResponse extends ModuloListadoResponse {
  descripcion: string | null;
  ruta: string;
  responsable_actualizacion: string | null;
  fecha_actualizacion: Date;
}

export interface ModuloCreateResponse {
  message: string;
  id: string;
}

export interface ModuloEstadoResponse {
  message: string;
  id: string;
  estado: string;
}
