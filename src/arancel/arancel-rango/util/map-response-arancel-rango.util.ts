import { ArancelRango } from '../entities/arancel-rango.entity';
import { ArancelRangoResponse } from '../interface/arancel-rango-response.interface';

export function mapearRespuestaArancelRango(
  rango: ArancelRango,
): ArancelRangoResponse {
  return {
    id: rango.id,
    arancel_det_id: rango.arancel_det_id,
    desde: rango.desde,
    hasta: rango.hasta,
    base_fija: rango.base_fija,
    porcentaje: rango.porcentaje,
    excedente: rango.excedente,
    tarifa_id: rango.tarifa_id,
    estado: rango.estado,
    responsable_creacion: rango.usuario_creador?.username ?? null,
    responsable_actualizacion: rango.usuario_actualizador?.username ?? null,
  };
}
