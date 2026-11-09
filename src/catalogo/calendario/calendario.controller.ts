/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario.controller.ts
 * Descripción:
 * Expone los endpoints para el registro, consulta,
 * actualización y administración del calendario.
 *
 * Desarrollado por: Missael Apaza
 */

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CalendarioService } from './calendario.service';

import { CreateCalendarioDto } from './dto/create-calendario.dto';
import { CreateCalendarioLoteDto } from './dto/create-calendario-lote.dto';
import { UpdateCalendarioDto } from './dto/update-calendario.dto';
import { QueryCalendarioDto } from './dto/query-calendario.dto';

import {
  CalendarioCreateResponse,
  CalendarioFechaResponse,
  CalendarioLoteResponse,
  CalendarioMessageResponse,
  CalendarioResponse,
} from './interface/calendario-response.interface';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/* ID TEMPORAL */
const id_usuario = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador encargado de gestionar las solicitudes HTTP
 * del catálogo de calendario.
 *
 * Desarrollado por: Missael Apaza
 */
@ApiTags('Catálogos - Calendario')
@Controller('catalogos/calendario')
export class CalendarioController {
  /**
   * Inicializa el servicio de calendario.
   *
   * Desarrollado por: Missael Apaza
   */
  constructor(private readonly calendarioService: CalendarioService) {}

  /**
   * Registra una fecha en el calendario.
   *
   * Desarrollado por: Missael Apaza
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar una fecha en el calendario',
  })
  @ApiResponse({
    status: 201,
    description: 'Fecha registrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos proporcionados no son válidos.',
  })
  @ApiResponse({
    status: 409,
    description: 'La fecha ya se encuentra registrada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crear(@Body() dto: CreateCalendarioDto): Promise<CalendarioCreateResponse> {
    return this.calendarioService.crear(dto, id_usuario);
  }

  /**
   * Registra múltiples fechas en el calendario.
   *
   * Desarrollado por: Missael Apaza
   */
  @Post('lote')
  @ApiOperation({
    summary: 'Registrar múltiples fechas en el calendario',
  })
  @ApiResponse({
    status: 201,
    description: 'Fechas registradas correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos proporcionados no son válidos.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Una o más fechas ya se encuentran registradas o hay duplicados en el lote.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crearLote(
    @Body() dto: CreateCalendarioLoteDto,
  ): Promise<CalendarioLoteResponse> {
    return this.calendarioService.crearLote(dto, id_usuario);
  }

  /**
   * Obtiene el listado paginado del calendario.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get()
  @ApiOperation({
    summary: 'Listar fechas del calendario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado obtenido correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  listar(
    @Query() query: QueryCalendarioDto,
  ): Promise<PaginatedResponse<CalendarioResponse>> {
    return this.calendarioService.listar(query);
  }

  /**
   * Consulta una fecha y determina su condición de día hábil.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get('fecha/:fecha')
  @ApiOperation({
    summary: 'Consultar una fecha del calendario',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha con formato YYYY-MM-DD.',
    example: '2026-11-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'La fecha proporcionada no es válida.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  buscarPorFecha(
    @Param('fecha') fecha: string,
  ): Promise<CalendarioFechaResponse> {
    return this.calendarioService.buscarPorFecha(fecha);
  }

  /**
   * Obtiene un registro mediante su identificador.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar un registro por identificador',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el registro.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CalendarioResponse> {
    return this.calendarioService.buscarPorId(id);
  }

  /**
   * Actualiza la información de un registro del calendario.
   *
   * Desarrollado por: Missael Apaza
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un registro del calendario',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos o intento de actualizar un registro inactivo.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el registro.',
  })
  @ApiResponse({
    status: 409,
    description: 'La fecha ya se encuentra registrada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarioDto,
  ): Promise<CalendarioMessageResponse> {
    return this.calendarioService.actualizar(id, dto, id_usuario);
  }

  /**
   * Cambia el estado de un registro del calendario.
   *
   * Desarrollado por: Missael Apaza
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar el estado de un registro',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el registro.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CalendarioMessageResponse> {
    return this.calendarioService.cambiarEstado(id, id_usuario);
  }
}
