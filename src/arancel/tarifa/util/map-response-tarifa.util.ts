import { Tarifa } from '../entities/tarifa.entity';
import { TarifaResponse } from '../interface/tarifa-response.interface';

export function mapearRespuestaTarifa(tarifa: Tarifa): TarifaResponse {
  return {
    id: tarifa.id,
    arancel_det_id: tarifa.arancel_det_id,
    vigente_desde: tarifa.vigente_desde,
    vigente_hasta: tarifa.vigente_hasta,
    monto: tarifa.monto,
    referencia_aprobacion: tarifa.referencia_aprobacion,
    estado: tarifa.estado,
    responsable_creacion: tarifa.usuario_creador?.username ?? null,
    responsable_actualizacion: tarifa.usuario_actualizador?.username ?? null,
  };
}
