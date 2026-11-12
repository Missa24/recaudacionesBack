/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: usuario-rol.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para la asignación,
 * consulta, actualización y cambio de estado de roles de usuarios.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';

import { UsuarioRolService } from './usuario-rol.service';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import { QueryUsuarioRolDto } from './dto/query-usuario-rol.dto';
import { AsignarVariosUsuarioRolDto } from './dto/crear-varios-usuario-rol.dto';
import { DesactivarVariosUsuarioRolDto } from './dto/desactivar-varios-usuario-rol.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: UsuarioRolController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con las asignaciones
 * de roles a usuarios y delega su procesamiento al servicio.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
@ApiTags('Seguridad / UsuarioRol')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) {}

  /*
  Nombre de la ruta: usuario-rol
  Método HTTP: POST
  Descripción: Asigna un rol a un usuario.
  Cuerpo de la solicitud:
    - CreateUsuarioRolDto: usuario_id y rol_id.
  Respuestas posibles:
    - 201: Asignación registrada correctamente.
    - 400: Datos inválidos.
    - 403: Acceso denegado.
    - 404: Usuario o rol no encontrado.
    - 409: Asignación duplicada o entidad inactiva.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Post()
  @ApiOperation({
    summary: 'Asignar rol a usuario',
    description: 'Asigna un rol existente a un usuario del sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Rol asignado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o rol no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'La asignación ya existe o una entidad está inactiva.',
  })
  crear(@Body() dto: CreateUsuarioRolDto) {
    return this.usuarioRolService.crear(dto, userId);
  }

  /*
  Método HTTP: POST
  Ruta: usuario-rol/usuario/:usuario_id/roles
  Descripción: Asigna varios roles a un usuario.
  */
  @Post('usuario/:usuario_id/roles')
  @ApiOperation({
    summary: 'Asignar varios roles a un usuario',
    description:
      'Permite asignar varios roles activos a un usuario en una sola operación.',
  })
  @ApiParam({
    name: 'usuarioId',
    description: 'Identificador UUID del usuario.',
  })
  @ApiResponse({
    status: 201,
    description: 'Roles asignados correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o roles no encontrados.',
  })
  @ApiResponse({
    status: 409,
    description: 'Uno o varios roles ya están asignados.',
  })
  asignarVarios(
    @Param('usuario_id') usuario_id: string,
    @Body() dto: AsignarVariosUsuarioRolDto,
  ) {
    return this.usuarioRolService.asignarVarios(usuario_id, dto, userId);
  }

  /*
  Nombre de la ruta: usuario-rol
  Método HTTP: GET
  Descripción: Obtiene las asignaciones aplicando búsqueda,
               filtros, ordenamiento y paginación.
  Parámetros de consulta:
    - QueryUsuarioRolDto.
  Respuestas posibles:
    - 200: Listado paginado de asignaciones.
    - 403: Acceso denegado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Get()
  @ApiOperation({
    summary: 'Listar asignaciones de roles',
    description:
      'Permite buscar, filtrar, ordenar y paginar las asignaciones de roles.',
  })
  @ApiOkResponse({
    description: 'Listado de asignaciones obtenido correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  listar(@Query() query: QueryUsuarioRolDto) {
    return this.usuarioRolService.listar(query);
  }

  /*
  Nombre de la ruta: usuario-rol/:id
  Método HTTP: GET
  Descripción: Obtiene una asignación mediante su identificador.
  Parámetros de ruta:
    - id: Identificador UUID de la asignación.
  Respuestas posibles:
    - 200: Asignación encontrada.
    - 403: Acceso denegado.
    - 404: Asignación no encontrada.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener asignación por ID',
    description: 'Busca una asignación de rol mediante su identificador único.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la asignación.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación encontrada.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada.',
  })
  obtenerPorId(@Param('id') id: string) {
    return this.usuarioRolService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: usuario-rol/usuario/:usuario_id
  Método HTTP: GET
  Descripción: Obtiene todos los roles activos asignados a un usuario.
  Parámetros:
    - usuarioId: Identificador UUID del usuario.
  Respuestas posibles:
    - 200: Roles encontrados.
    - 403: Acceso denegado.
    - 404: Usuario no encontrado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Get('usuario/:usuario_id')
  @ApiOperation({
    summary: 'Listar roles de un usuario',
    description:
      'Obtiene todos los roles activos y no eliminados asignados a un usuario.',
  })
  @ApiParam({
    name: 'usuario_id',
    description: 'Identificador UUID del usuario.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario obtenidos correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  listarPorUsuario(@Param('usuario_id') usuario_id: string) {
    return this.usuarioRolService.listarPorUsuario(usuario_id);
  }

  /*
  Método HTTP: GET
  Ruta: usuario-rol/rol/:rolId
  Descripción: Obtiene los usuarios que tienen asignado un rol.
  */
  @Get('rol/:rolId')
  @ApiOperation({
    summary: 'Listar usuarios por rol',
    description: 'Obtiene los usuarios que tienen asignado un rol determinado.',
  })
  @ApiParam({
    name: 'rolId',
    description: 'Identificador UUID del rol.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuarios obtenidos correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado.',
  })
  listarPorRol(@Param('rolId') rolId: string) {
    return this.usuarioRolService.listarPorRol(rolId);
  }

  /*
  Nombre de la ruta: usuario-rol/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente una asignación existente.
  Parámetros de ruta:
    - id: Identificador UUID de la asignación.
  Cuerpo de la solicitud:
    - UpdateUsuarioRolDto.
  Respuestas posibles:
    - 200: Asignación actualizada.
    - 400: Datos inválidos.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
    - 409: Asignación duplicada o inactiva.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar asignación',
    description: 'Modifica el usuario o el rol de una asignación existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la asignación.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Asignación duplicada o inactiva.',
  })
  actualizar(@Param('id') id: string, @Body() dto: UpdateUsuarioRolDto) {
    return this.usuarioRolService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: usuario-rol/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia el estado de una asignación.
  Parámetros de ruta:
    - id: Identificador UUID de la asignación.
  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 403: Acceso denegado.
    - 404: Asignación no encontrada.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de asignación',
    description: 'Alterna el estado de la asignación entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la asignación.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada.',
  })
  cambiarEstado(@Param('id') id: string) {
    return this.usuarioRolService.cambiarEstado(id, userId);
  }

  /*
  Método HTTP: PATCH
  Ruta: usuario-rol/usuario/:usuario_id/desactivar-roles
  Descripción: Desactiva varias asignaciones de roles de un usuario.
  */
  @Patch('usuario/:usuario_id/desactivar-roles')
  @ApiOperation({
    summary: 'Desactivar varios roles de un usuario',
    description:
      'Desactiva varias asignaciones mediante eliminación lógica, conservando el historial.',
  })
  @ApiParam({
    name: 'usuario_id',
    description: 'Identificador UUID del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles desactivados correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Una o varias asignaciones no existen o están inactivas.',
  })
  desactivarVarios(
    @Param('usuario_id') usuarioId: string,
    @Body() dto: DesactivarVariosUsuarioRolDto,
  ) {
    return this.usuarioRolService.desactivarVarios(usuarioId, dto, userId);
  }
}
