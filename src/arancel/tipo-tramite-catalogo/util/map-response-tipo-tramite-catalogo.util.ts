import { TipoTramiteCatalogo } from '../entities/tipo-tramite-catalogo.entity';
import { TipoTramiteCatalogoResponse } from '../interface/tipo-tramite-catalogo-response.interface';

export function mapearRespuestaTipoTramiteCatalogo(
  tipo: TipoTramiteCatalogo,
): TipoTramiteCatalogoResponse {
  return {
    id: tipo.id,
    codigo: tipo.codigo,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    tipo_vut: tipo.tipo_vut,
    dependencia_ejecutora_id: tipo.dependencia_ejecutora_id,
    requiere_hoja_ruta: tipo.requiere_hoja_ruta,
    requiere_derivacion: tipo.requiere_derivacion,
    estado: tipo.estado,
    responsable_creacion: tipo.usuario_creador?.username ?? null,
    responsable_actualizacion: tipo.usuario_actualizador?.username ?? null,
  };
}
