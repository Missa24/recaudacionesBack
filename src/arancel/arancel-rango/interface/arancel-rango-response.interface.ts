export interface ArancelRangoResponse {
  id: string;
  desde: number;
  hasta: number | null;
  base_fija: number;
  porcentaje: number;
  excedente: number;
  tarifa_id: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelRangoMessageResponse {
  message: string;
}
