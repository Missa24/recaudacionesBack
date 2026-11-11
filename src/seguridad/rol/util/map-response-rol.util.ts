import { Rol } from '../entities/rol.entity';
import {
  RolListadoResponse,
  RolDetalleResponse,
} from '../interfaces/rol-response.interface';

/**
 * Selecciona los datos del listado sin exponer la entidad completa.
 * Desarrollado por: Oscar Canchari.
 */
export function mapResponseRolListado(registro: Rol): RolListadoResponse {
  return {
    id: registro.id,
    nombre: registro.nombre,
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
export function mapResponseRolDetalle(registro: Rol): RolDetalleResponse {
  return {
    ...mapResponseRolListado(registro),
    descripcion: registro.descripcion,
    responsable_actualizacion: registro.user_update,
    fecha_actualizacion: registro.updated_at,
  };
}
