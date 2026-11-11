import { ArancelRequisito } from '../entities/requisito.entity';
import { RequisitoResponse } from '../interface/requisito-response.interface';

export function mapearRespuestaRequisito(
  requisito: ArancelRequisito,
): RequisitoResponse {
  return {
    id: requisito.id,
    tipo_tramite_id: requisito.tipo_tramite_id,
    requisito_catalogo_id: requisito.requisito_catalogo_id,
    obligatorio: requisito.obligatorio,
    orden: requisito.orden,
    estado: requisito.estado,
    responsable_creacion: requisito.usuario_creador?.username ?? null,
    responsable_actualizacion: requisito.usuario_actualizador?.username ?? null,
  };
}
