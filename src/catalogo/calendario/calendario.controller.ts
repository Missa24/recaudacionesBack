/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario.controller.ts
 * Descripción:
 * Expone los endpoints para el registro, consulta,
 * actualización y administración del calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CalendarioService } from './calendario.service';

import { CreateCalendarioDto } from './dto/create-calendario.dto';
import { CreateCalendarioRangoDto } from './dto/create-calendario-lote.dto';
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
const idUsuario = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador encargado de gestionar las solicitudes HTTP
 * del catálogo de calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos - Calendario')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('catalogos/calendario')
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  /**
   * Registra una fecha individual en el calendario.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'La fecha ya se encuentra registrada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crear(@Body() dto: CreateCalendarioDto): Promise<CalendarioCreateResponse> {
    return this.calendarioService.crear(dto, idUsuario);
  }

  /**
   * Registra un rango de fechas, omitiendo las que ya existen.
   */
  @Post('rango')
  @ApiOperation({
    summary: 'Registrar un rango de fechas en el calendario',
    description:
      'Registra un rango de fechas. Las fechas que ya existan serán omitidas sin sobreescribir sus datos.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Rango procesado. Revisa el campo "omitidas" para ver las que ya existían.',
  })
  @ApiResponse({
    status: 400,
    description: 'Rango inválido o fechas con formato incorrecto.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crearPorRango(
    @Body() dto: CreateCalendarioRangoDto,
  ): Promise<CalendarioLoteResponse> {
    return this.calendarioService.crearPorRango(dto, idUsuario);
  }

  /**
   * Obtiene el listado paginado del calendario.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el registro.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  buscarPorId(@Param('id') id: string): Promise<CalendarioResponse> {
    return this.calendarioService.buscarPorId(id);
  }

  /**
   * Actualiza la información de un registro del calendario.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
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
    @Param('id') id: string,
    @Body() dto: UpdateCalendarioDto,
  ): Promise<CalendarioMessageResponse> {
    return this.calendarioService.actualizar(id, dto, idUsuario);
  }

  /**
   * Cambia el estado de un registro del calendario.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el registro.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  cambiarEstado(@Param('id') id: string): Promise<CalendarioMessageResponse> {
    return this.calendarioService.cambiarEstado(id, idUsuario);
  }
}
