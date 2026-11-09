/**
 * Módulo: Catálogo - Interés
 * Archivo: interes.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización, sincronización y cambio de estado de los valores de Interés.
 *
 * Desarrollado por: Missael Apaza
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { InteresService } from './interes.service';
import { CreateInteresDto } from './dto/create-interes.dto';
import { UpdateInteresDto } from './dto/update-interes.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueryInteresDto } from './dto/query-interes.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: InteresController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los valores de Interés
 * y delega su procesamiento a los servicios correspondientes.
 *
 * Desarrollado por: Missael Apaza
 */
@ApiTags('Catálogos - Interés')
@Controller('interes')
export class InteresController {
  constructor(private readonly interesService: InteresService) {}
  /**
   * Registra un nuevo valor de Interés mediante los datos proporcionados.
   *
   * Desarrollado por: Missael Apaza
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar Interés',
    description: 'Registra un nuevo interés para una fecha.',
  })
  @ApiResponse({
    status: 201,
    description: 'Interés registrado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un interés para esa fecha.',
  })
  crear(@Body() dto: CreateInteresDto) {
    return this.interesService.crear(dto, userId);
  }

  /**
   * Obtiene los registros de Interés aplicando filtros y paginación.
   *
   * Desarrollado por: Missael Apaza
   */
  @ApiOperation({
    summary: 'Lista registro de Interés',
    description: 'Permite buscar, filtrar, ordenar y paginar los registros.',
  })
  @ApiOkResponse({
    description: 'Listado de registros UFV obtenido correctamente.',
  })
  @Get()
  listar(@Query() query: QueryInteresDto) {
    return this.interesService.listar(query);
  }

  /**
   * Obtiene un registro de una Entidad mediante su identificador único.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener Interés por Id',
    description: 'Busca un registro de interpes mediante el identificador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 200, description: 'Registro no encontrado.' })
  ObtenerPorId(@Param('id') id: string) {
    return this.interesService.buscarPorId(id);
  }

  /**
   * Obtiene un registro Interés correspondiente a una fecha específica.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get('fecha/:fecha')
  @ApiOperation({
    summary: 'Obtener un Interes por fecha',
    description:
      'Busca un registro de Interés correspondiente a una fecha especifica.',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha de consulta en formato AAAA-MM-DD',
    example: '2026-11-09',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'No existe un Interés para esa fecha.',
  })
  obtenerPorFecha(@Param('fecha') fecha: string) {
    return this.interesService.buscarPorFecha(fecha);
  }

  /**
   * Actualiza parcialmente los datos de un registro de Interés existente.
   *
   * Desarrollado por: Missael Apaza
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar interés',
    description: 'Modifica los datos de un registro de Interés existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Interés actualizado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateInteresDto) {
    return this.interesService.actualizar(id, dto, userId);
  }

  /**
   * Cambia el estado de un registro de Interés entre ACTIVO e INACTIVO.
   *
   * Desarrollado por: Missael Apaza
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de Interés',
    description: 'Alterna el estado del registro entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  cambiarEstado(@Param('id') id: string) {
    return this.interesService.cambiarEstado(id, userId);
  }
}
