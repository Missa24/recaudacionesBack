export interface TarifaResponse {
  id: string;
  arancel_det_id: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  monto: number;
  referencia_aprobacion: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface TarifaMessageResponse {
  message: string;
}
