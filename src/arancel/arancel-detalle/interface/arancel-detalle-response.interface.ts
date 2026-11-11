export interface ArancelDetalleResponse {
  id: string;
  arancel_general_id: string;
  tipo_tramite_id: string;
  nro_arancel_det: string;
  descripcion: string;
  monto_variable: boolean;
  unidad_calculo: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelDetalleMessageResponse {
  message: string;
}
