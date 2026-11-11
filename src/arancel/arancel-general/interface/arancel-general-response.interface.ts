export interface ArancelGeneralResponse {
  id: string;
  dependencia_id: string;
  nro_arancel_gral: string;
  descripcion: string;
  cuenta_destino_id: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelGeneralMessageResponse {
  message: string;
}
