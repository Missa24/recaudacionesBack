/**
 * Módulo: Seguridad - Usuario
 * Archivo: usuario.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización y cambio de estado de los usuarios.
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

import { UsuarioService } from './usuario.service';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: UsuarioController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los usuarios
 * y delega su procesamiento al servicio correspondiente.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@ApiTags('Seguridad / Usuario')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /**
   * Registra un nuevo usuario.
   *
   * POST /usuarios
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Registra un nuevo usuario en el sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente.',
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
    status: 409,
    description: 'El username o correo electrónico ya existe.',
  })
  crear(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.crear(dto, userId);
  }

  /**
   * Lista usuarios con filtros y paginación.
   *
   * GET /usuarios
   */
  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Permite buscar, filtrar, ordenar y paginar los usuarios registrados.',
  })
  @ApiOkResponse({
    description: 'Listado de usuarios obtenido correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  listar(@Query() query: QueryUsuarioDto) {
    return this.usuarioService.listar(query);
  }

  /**
   * Busca un usuario por username.
   *
   * GET /usuarios/username/:username
   *
   * Se declara antes de la ruta genérica :id.
   */
  @Get('username/:username')
  @ApiOperation({
    summary: 'Buscar usuario por username',
    description: 'Obtiene un usuario mediante su nombre de usuario.',
  })
  @ApiParam({
    name: 'username',
    description: 'Nombre de usuario.',
    example: 'missael',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  buscarPorUsername(@Param('username') username: string) {
    return this.usuarioService.buscarPorUsername(username);
  }

  /**
   * Busca un usuario por UUID.
   *
   * GET /usuarios/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Busca un usuario mediante su identificador UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del usuario.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  obtenerPorId(@Param('id') id: string) {
    return this.usuarioService.buscarPorId(id);
  }

  /**
   * Actualiza los datos de un usuario.
   *
   * PATCH /usuarios/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Modifica parcialmente los datos de un usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario está inactivo o existen datos duplicados.',
  })
  actualizar(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.actualizar(id, dto, userId);
  }

  /**
   * Cambia el estado de un usuario.
   *
   * PATCH /usuarios/:id/estado
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de usuario',
    description: 'Alterna el estado del usuario entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del usuario actualizado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  cambiarEstado(@Param('id') id: string) {
    return this.usuarioService.cambiarEstado(id, userId);
  }
}
