/**
 * Módulo: Seguridad - Usuario
 * Archivo: map-response-usuario.util.ts
 *
 * Descripción:
 * Proporciona una función auxiliar para transformar
 * una entidad Usuario en su estructura de respuesta.
 *
 * Incluye los nombres de usuario de los responsables
 * de creación, actualización y eliminación lógica.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from '../entities/usuario.entity';
import { UsuarioResponse } from '../interfaces/usuario-response.interface';

/**
 * Transforma una entidad Usuario en su estructura de respuesta.
 *
 * Obtiene los nombres de usuario de las relaciones de auditoría
 * cuando estas se encuentran disponibles.
 *
 */
export function mapearRespuesta(usuario: Usuario): UsuarioResponse {
  return {
    id: usuario.id,
    username: usuario.username,
    email: usuario.email,
    ci: usuario.ci,
    nombres: usuario.nombres,
    apellido_paterno: usuario.apellidoPaterno,
    apellido_materno: usuario.apellidoMaterno,
    celular: usuario.celular,
    estado: usuario.estado,
    ultimo_acceso: usuario.ultimoAcceso,

    responsable_creacion: usuario.usuario_creador?.username ?? null,
    responsable_actualizacion: usuario.usuario_actualizador?.username ?? null,
    responsable_eliminacion: usuario.usuario_eliminador?.username ?? null,
  };
}
