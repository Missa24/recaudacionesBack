/**
 * Módulo: Seguridad - Rol
 * Archivo: rol.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización y cambio de estado de los roles.
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

import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { QueryRolDto } from './dto/query-rol.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: RolController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los roles
 * y delega su procesamiento al servicio correspondiente.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
@ApiTags('Seguridad / Rol')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  /*
  Nombre de la ruta: rol
  Método HTTP: POST
  Descripción: Registra un nuevo rol dentro del sistema.
  Cuerpo de la solicitud:
    - CreateRolDto: Código y descripción del rol.
  Respuestas posibles:
    - 201: Rol registrado correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 409: Ya existe un rol con ese código.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar rol',
    description: 'Registra un nuevo rol dentro del sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Rol registrado correctamente.',
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
    description: 'Ya existe un rol con ese código.',
  })
  crear(@Body() dto: CreateRolDto) {
    return this.rolService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: rol
  Método HTTP: GET
  Descripción: Obtiene los roles aplicando filtros, búsqueda,
               ordenamiento y paginación.
  Parámetros de consulta:
    - QueryRolDto: Filtros de búsqueda, estado, orden y paginación.
  Respuestas posibles:
    - 200: Listado de roles obtenido correctamente.
    - 403: Acceso denegado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @ApiOperation({
    summary: 'Listar roles',
    description:
      'Permite buscar, filtrar, ordenar y paginar los registros de roles.',
  })
  @ApiOkResponse({
    description: 'Listado de roles obtenido correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @Get()
  listar(@Query() query: QueryRolDto) {
    return this.rolService.listar(query);
  }

  /*
  Nombre de la ruta: rol/:id
  Método HTTP: GET
  Descripción: Obtiene un rol mediante su identificador único.
  Parámetros de ruta:
    - id: Identificador UUID del rol.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Busca un rol mediante su identificador único.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del rol.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado.',
  })
  obtenerPorId(@Param('id') id: string) {
    return this.rolService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: rol/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente los datos de un rol existente.
  Parámetros de ruta:
    - id: Identificador UUID del rol.
  Cuerpo de la solicitud:
    - UpdateRolDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Rol actualizado correctamente.
    - 400: Datos de actualización inválidos.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
    - 409: Rol inactivo o código duplicado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Modifica los datos de un rol existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del rol.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado correctamente.',
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
    description: 'Rol inactivo o código duplicado.',
  })
  actualizar(@Param('id') id: string, @Body() dto: UpdateRolDto) {
    return this.rolService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: rol/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia el estado de un rol entre ACTIVO e INACTIVO.
  Parámetros de ruta:
    - id: Identificador UUID del rol.
  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de rol',
    description: 'Alterna el estado del rol entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del rol.',
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
    description: 'Registro no encontrado.',
  })
  cambiarEstado(@Param('id') id: string) {
    return this.rolService.cambiarEstado(id, userId);
  }
}
