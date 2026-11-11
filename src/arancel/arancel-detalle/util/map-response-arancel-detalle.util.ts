import { ArancelDetalle } from '../entities/arancel-detalle.entity';
import { ArancelDetalleResponse } from '../interface/arancel-detalle-response.interface';

export function mapearRespuestaArancelDetalle(
  arancel: ArancelDetalle,
): ArancelDetalleResponse {
  return {
    id: arancel.id,
    arancel_gral_id: arancel.arancel_gral_id,
    tipo_tramite_id: arancel.tipo_tramite_id,
    nro_arancel_det: arancel.nro_arancel_det,
    descripcion: arancel.descripcion,
    monto_variable: arancel.monto_variable,
    unidad_calculo: arancel.unidad_calculo,
    estado: arancel.estado,
    responsable_creacion: arancel.usuario_creador?.username ?? null,
    responsable_actualizacion: arancel.usuario_actualizador?.username ?? null,
  };
}
