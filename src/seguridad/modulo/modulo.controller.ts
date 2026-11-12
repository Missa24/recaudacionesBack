/**
 * Módulo: Seguridad - Módulo
 * Archivo: modulo.controller.ts
 *
 * Descripción:
 * Controlador encargado de exponer los endpoints para
 * registrar, consultar, actualizar y cambiar el estado
 * de los módulos del sistema.
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

import { ModuloService } from './modulo.service';

import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { QueryModuloDto } from './dto/query-modulo.dto';

// Identificador temporal del usuario responsable.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Seguridad / Módulo')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('modulo')
export class ModuloController {
  constructor(private readonly moduloService: ModuloService) {}

  /*
  Nombre de la ruta: modulo
  Método HTTP: POST
  Descripción: Registra un nuevo módulo.
  */

  @Post()
  @ApiOperation({
    summary: 'Registrar módulo',
    description: 'Registra un nuevo módulo funcional en el sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Módulo registrado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 409,
    description: 'El código del módulo ya existe.',
  })
  crear(@Body() dto: CreateModuloDto) {
    return this.moduloService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: modulo
  Método HTTP: GET
  Descripción: Lista los módulos con filtros y paginación.
  */

  @Get()
  @ApiOperation({
    summary: 'Listar módulos',
    description: 'Permite buscar, filtrar, ordenar y paginar los módulos.',
  })
  @ApiOkResponse({
    description: 'Listado de módulos obtenido correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  listar(@Query() query: QueryModuloDto) {
    return this.moduloService.listar(query);
  }

  /*
  Nombre de la ruta: modulo/:id
  Método HTTP: GET
  Descripción: Busca un módulo por su identificador.
  */

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener módulo por ID',
    description: 'Busca un módulo mediante su identificador UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del módulo.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo no encontrado.',
  })
  obtenerPorId(@Param('id') id: string) {
    return this.moduloService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: modulo/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente un módulo.
  */

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar módulo',
    description: 'Permite modificar parcialmente los datos de un módulo.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del módulo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo actualizado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El módulo está inactivo o el código ya existe.',
  })
  actualizar(@Param('id') id: string, @Body() dto: UpdateModuloDto) {
    return this.moduloService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: modulo/:id/estado
  Método HTTP: PATCH
  Descripción: Alterna el estado del módulo.
  */

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado del módulo',
    description: 'Alterna el estado del módulo entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del módulo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del módulo actualizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo no encontrado.',
  })
  cambiarEstado(@Param('id') id: string) {
    return this.moduloService.cambiarEstado(id, userId);
  }
}
