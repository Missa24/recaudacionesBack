import { UsuarioRol } from '../entities/usuario-rol.entity';
import { UsuarioRolResponse } from '../interface/usuario-rol-response.interface';

export function mapearRespuestaUsuarioRol(
  asignacion: UsuarioRol,
): UsuarioRolResponse {
  return {
    id: asignacion.id,
    id_usuario: asignacion.idUsuario,
    usuario: {
      id_usuario: asignacion.usuario.idUsuario,
      username: asignacion.usuario.username,
      nombres: asignacion.usuario.nombres,
      ci: asignacion.usuario.ci,
    },
    id_rol: asignacion.idRol,
    rol: {
      id: asignacion.rol.id,
      nombre: asignacion.rol.nombre,
      codigo: asignacion.rol.codigo,
    },
    estado: asignacion.estado,
    created_at: asignacion.createdAt,
    updated_at: asignacion.updatedAt,
    deleted_at: asignacion.deletedAt,
    responsable_creacion: asignacion.usuarioCreador?.username ?? null,
    responsable_actualizacion: asignacion.usuarioActualizador?.username ?? null,
  };
}
