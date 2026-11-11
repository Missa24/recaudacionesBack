import { Modulo } from '../entities/modulo.entity';
import {
  ModuloListadoResponse,
  ModuloDetalleResponse,
} from '../interfaces/modulo-response.interface';

/**
 * Selecciona los datos del listado sin exponer la entidad completa.
 * Desarrollado por: Oscar Canchari.
 */
export function mapResponseModuloListado(
  registro: Modulo,
): ModuloListadoResponse {
  return {
    id: registro.id,
    nombres: registro.nombres,
    codigo: registro.codigo,
    estado: registro.estado,
    responsable_creacion: registro.user_created,
    fecha_creacion: registro.created_at,
  };
}

/**
 * Agrega los campos del detalle y la auditoría de actualización.
 * Desarrollado por: Oscar Canchari.
 */
export function mapResponseModuloDetalle(
  registro: Modulo,
): ModuloDetalleResponse {
  return {
    ...mapResponseModuloListado(registro),
    descripcion: registro.descripcion,
    ruta: registro.ruta,
    responsable_actualizacion: registro.user_update,
    fecha_actualizacion: registro.updated_at,
  };
}
