import { RolModuloPermiso } from '../entities/rol-modulo-permiso.entity';
import { RolModuloPermisoResponse } from '../interface/rol-modulo-permiso-response.interface';

export function mapearRespuestaRolModuloPermiso(
  asignacion: RolModuloPermiso,
): RolModuloPermisoResponse {
  return {
    id: asignacion.id,
    rol_id: asignacion.rol_id,
    rol: {
      id: asignacion.rol.id,
      nombre: asignacion.rol.nombre,
      codigo: asignacion.rol.codigo,
    },
    modulo_id: asignacion.modulo_id,
    modulo: {
      id: asignacion.modulo.id,
      nombres: asignacion.modulo.nombres,
      codigo: asignacion.modulo.codigo,
    },
    permiso_id: asignacion.permiso_id,
    permiso: {
      id: asignacion.permiso.id,
      nombre: asignacion.permiso.nombre,
      codigo: asignacion.permiso.codigo,
    },
    estado: asignacion.estado,
    created_at: asignacion.createdAt,
    updated_at: asignacion.updatedAt,
    deleted_at: asignacion.deletedAt,
    responsable_creacion: asignacion.usuarioCreador?.username ?? null,
    responsable_actualizacion: asignacion.usuarioActualizador?.username ?? null,
  };
}
