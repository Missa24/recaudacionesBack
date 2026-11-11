import { ArancelGeneral } from '../entities/arancel-general.entity';
import { ArancelGeneralResponse } from '../interface/arancel-general-response.interface';

export function mapearRespuestaArancelGeneral(
  arancel: ArancelGeneral,
): ArancelGeneralResponse {
  return {
    id: arancel.id,
    dependencia_id: arancel.dependencia_id,
    nro_arancel_gral: arancel.nro_arancel_gral,
    descripcion: arancel.descripcion,
    cuenta_destino_id: arancel.cuenta_destino_id,
    estado: arancel.estado,
    responsable_creacion: arancel.usuario_creador?.username ?? null,
    responsable_actualizacion: arancel.usuario_actualizador?.username ?? null,
  };
}
