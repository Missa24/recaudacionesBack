/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: map-response-usuario-rol.util.ts
 * Descripción:
 * Transforma una entidad UsuarioRol en su estructura de respuesta,
 * incluyendo información del usuario, rol y responsables de auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { UsuarioRol } from '../entities/usuario-rol.entity';
import { UsuarioRolResponse } from '../interface/usuario-rol-response.interface';

/**
 * Función: mapearRespuesta
 * Descripción:
 * Transforma una entidad UsuarioRol en su estructura de respuesta.
 */
export function mapearRespuesta(usuarioRol: UsuarioRol): UsuarioRolResponse {
  return {
    id: usuarioRol.id,

    usuario_id: usuarioRol.usuario_id,
    usuario: usuarioRol.usuario?.username ?? null,

    rol_id: usuarioRol.rol_id,
    rol: usuarioRol.rol?.codigo ?? null,
    descripcion_rol: usuarioRol.rol?.descripcion ?? null,

    estado: usuarioRol.estado,

    responsable_creacion: usuarioRol.usuario_creador?.username ?? null,

    responsable_actualizacion:
      usuarioRol.usuario_actualizador?.username ?? null,

    responsable_eliminacion: usuarioRol.usuario_eliminador?.username ?? null,
  };
}
