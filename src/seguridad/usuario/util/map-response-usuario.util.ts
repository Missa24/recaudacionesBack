import { Usuario } from '../entities/usuario.entity';

import {
  UsuarioDetalleResponse,
  UsuarioListadoResponse,
} from '../interfaces/usuario-response.interface';

/**
 * Módulo: Seguridad / Usuario
 * Archivo: map-response-usuario.util.ts
 *
 * Descripción:
 * Transforma entidades TypeORM en respuestas del frontend.
 * Separa los campos del listado y del detalle.
 *
 * Fecha de creación: 2026-11-10
 * Autor: Oscar Canchari
 */

/**
 * Nombre del método: mapResponseUsuarioListado
 *
 * Descripción:
 * Devuelve solamente los datos importantes del usuario,
 * incluyendo responsable y fecha de creación.
 *
 * Parámetros:
 * - usuario: Entidad Usuario obtenida de PostgreSQL.
 *
 * Retorno:
 * - UsuarioListadoResponse.
 */
export function mapResponseUsuarioListado(
  usuario: Usuario,
): UsuarioListadoResponse {
  return {
    idUsuario: usuario.idUsuario,
    username: usuario.username,
    nombres: usuario.nombres,
    apellido_paterno: usuario.apellidoPaterno,
    apellido_materno: usuario.apellidoMaterno,
    ci: usuario.ci,
    email: usuario.email,
    estado: usuario.estado,

    responsable_creacion: usuario.userCreated,
    fecha_creacion: usuario.createdAt,
  };
}

/**
 * Nombre del método: mapResponseUsuarioDetalle
 *
 * Descripción:
 * Devuelve los datos completos de un usuario.
 * Incluye fecha y responsable de creación y actualización.
 *
 * Parámetros:
 * - usuario: Entidad Usuario obtenida de PostgreSQL.
 *
 * Retorno:
 * - UsuarioDetalleResponse.
 */
export function mapResponseUsuarioDetalle(
  usuario: Usuario,
): UsuarioDetalleResponse {
  return {
    ...mapResponseUsuarioListado(usuario),

    celular: usuario.celular,
    ultimo_acceso: usuario.ultimoAcceso,

    responsable_actualizacion: usuario.userUpdate,
    fecha_actualizacion: usuario.updatedAt,
  };
}
