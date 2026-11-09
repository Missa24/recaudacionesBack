export interface DependenciaResponsable {
  username: string;
}

export interface DependenciaResponse {
  id: string;
  codigo: string;
  nombre: string;
  abreviacion: string;
  es_unidad_desconcentrada: boolean;
  estado: string;
  responsable_creacion: DependenciaResponsable | null;
  responsable_actualizacion: DependenciaResponsable | null;
}

export interface DependenciaMessageResponse {
  message: string;
}
