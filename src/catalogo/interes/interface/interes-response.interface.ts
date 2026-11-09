export interface InteresResponsable {
  username: string;
}

export interface InteresResponse {
  id: string;
  fecha_publicacion: string;
  valor: string;
  estado: string;

  responsable_creacion: InteresResponsable | null;
  responsable_actualizacion: InteresResponsable | null;
}

export interface InteresMessageResponse {
  message: string;
}
