export interface RequisitoResponse {
  id: string;
  tipo_tramite_id: string;
  requisito_catalogo_id: string;
  obligatorio: boolean;
  orden: number;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface RequisitoMessageResponse {
  message: string;
}
