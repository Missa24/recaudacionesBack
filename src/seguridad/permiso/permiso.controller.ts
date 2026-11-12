/**
 * Módulo: Seguridad - Permiso
 * Archivo: permiso.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para
 * registrar, consultar, actualizar y cambiar el estado
 * de los permisos del sistema.
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

import { PermisoService } from './permiso.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { QueryPermisoDto } from './dto/query-permiso.dto';

// Identificador temporal del usuario responsable.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Seguridad / Permiso')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('permiso')
export class PermisoController {
  constructor(private readonly permisoService: PermisoService) {}

  /*
  Nombre de la ruta: permiso
  Método HTTP: POST
  Descripción: Registra un nuevo permiso.
  */

  @Post()
  @ApiOperation({
    summary: 'Registrar permiso',
    description: 'Registra un nuevo permiso en el catálogo del sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Permiso registrado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 409,
    description: 'El código del permiso ya existe.',
  })
  crear(@Body() dto: CreatePermisoDto) {
    return this.permisoService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: permiso
  Método HTTP: GET
  Descripción: Lista los permisos aplicando filtros,
               búsqueda, ordenamiento y paginación.
  */

  @Get()
  @ApiOperation({
    summary: 'Listar permisos',
    description: 'Permite buscar, filtrar, ordenar y paginar los permisos.',
  })
  @ApiOkResponse({
    description: 'Listado de permisos obtenido correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  listar(@Query() query: QueryPermisoDto) {
    return this.permisoService.listar(query);
  }

  /*
  Nombre de la ruta: permiso/:id
  Método HTTP: GET
  Descripción: Busca un permiso por su identificador.
  */

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener permiso por ID',
    description: 'Busca un permiso mediante su identificador UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del permiso.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado.',
  })
  obtenerPorId(@Param('id') id: string) {
    return this.permisoService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: permiso/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente un permiso.
  */

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar permiso',
    description:
      'Permite modificar parcialmente el código y descripción de un permiso.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del permiso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso actualizado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El permiso está inactivo o el código ya existe.',
  })
  actualizar(@Param('id') id: string, @Body() dto: UpdatePermisoDto) {
    return this.permisoService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: permiso/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia el estado entre ACTIVO e INACTIVO.
  */

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado del permiso',
    description: 'Alterna el estado del permiso entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del permiso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del permiso actualizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado.',
  })
  cambiarEstado(@Param('id') id: string) {
    return this.permisoService.cambiarEstado(id, userId);
  }
}
