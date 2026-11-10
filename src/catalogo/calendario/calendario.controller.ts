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

  /*
  Nombre de la ruta: catalogos/calendario
  Método HTTP: POST
  Descripción: Registra una fecha individual en el calendario. Valida el formato de la fecha y que no se encuentre previamente registrada.
  Cuerpo de la solicitud (Body):
    - CreateCalendarioDto: Datos de la fecha a registrar (fecha, tipo, descripción, etc.).
  Respuestas posibles:
    - 201: Fecha registrada correctamente.
    - 400: Los datos proporcionados no son válidos.
    - 403: Acceso denegado.
    - 409: La fecha ya se encuentra registrada.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (idUsuario) hasta integrar el usuario autenticado desde el JWT.
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

  /*
  Nombre de la ruta: catalogos/calendario/rango
  Método HTTP: POST
  Descripción: Registra un rango de fechas en el calendario. Las fechas que ya existan son omitidas sin sobreescribir sus datos.
  Cuerpo de la solicitud (Body):
    - CreateCalendarioRangoDto: Fecha inicial, fecha final y datos comunes del rango.
  Respuestas posibles:
    - 201: Rango procesado. Revisa el campo "omitidas" para ver las que ya existían.
    - 400: Rango inválido o fechas con formato incorrecto.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Operación idempotente por fecha: no falla si una fecha ya existe, solo la omite.
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

  /*
  Nombre de la ruta: catalogos/calendario
  Método HTTP: GET
  Descripción: Obtiene el listado paginado de las fechas del calendario aplicando filtros de consulta.
  Parámetros de consulta (Query):
    - QueryCalendarioDto: Filtros de búsqueda y paginación.
  Respuestas posibles:
    - 200: Listado obtenido correctamente.
    - 400: Parámetros de consulta inválidos.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Respuesta envuelta en PaginatedResponse con metadatos de paginación.
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

  /*
  Nombre de la ruta: catalogos/calendario/fecha/:fecha
  Método HTTP: GET
  Descripción: Consulta una fecha específica y determina su condición de día hábil.
  Parámetros de ruta (Param):
    - fecha: Fecha con formato YYYY-MM-DD.
  Respuestas posibles:
    - 200: Consulta realizada correctamente.
    - 400: La fecha proporcionada no es válida.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: La condición de día hábil se calcula considerando el registro de calendario y fines de semana.
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

  /*
  Nombre de la ruta: catalogos/calendario/:id
  Método HTTP: GET
  Descripción: Obtiene un registro del calendario mediante su identificador UUID.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Registro encontrado correctamente.
    - 400: El identificador proporcionado no es un UUID válido.
    - 403: Acceso denegado.
    - 404: No se encontró el registro.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Ruta declarada después de las rutas específicas para evitar conflictos de matching.
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

  /*
  Nombre de la ruta: catalogos/calendario/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente la información de un registro del calendario.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Cuerpo de la solicitud (Body):
    - UpdateCalendarioDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Registro actualizado correctamente.
    - 400: Datos inválidos o intento de actualizar un registro inactivo.
    - 403: Acceso denegado.
    - 404: No se encontró el registro.
    - 409: La fecha ya se encuentra registrada.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No se permite actualizar registros inactivos.
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

  /*
  Nombre de la ruta: catalogos/calendario/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia (alterna) el estado de un registro del calendario entre ACTIVO e INACTIVO.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Estado cambiado correctamente.
    - 400: El identificador proporcionado no es un UUID válido.
    - 403: Acceso denegado.
    - 404: No se encontró el registro.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No recibe body; el nuevo estado se deriva del estado actual.
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
