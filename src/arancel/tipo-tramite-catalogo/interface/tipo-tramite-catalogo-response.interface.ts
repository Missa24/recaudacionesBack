export interface TipoTramiteCatalogoResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo_vut: string;
  dependencia_ejecutora_id: string | null;
  requiere_hoja_ruta: boolean;
  requiere_derivacion: boolean;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface TipoTramiteCatalogoMessageResponse {
  message: string;
}
