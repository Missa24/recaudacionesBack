/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización, sincronización y cambio de estado de los valores UFV.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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

import { UfvService } from './ufv.service';
import { CreateUfvDto } from './dto/create-ufv.dto';
import { UpdateUfvDto } from './dto/update-ufv.dto';
import { UfvApiService } from './ufv-api.service';
import { QueryUfvDto } from './dto/query-ufv.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: UfvController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los valores UFV
 * y delega su procesamiento a los servicios correspondientes.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / UFV')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('ufv')
export class UfvController {
  constructor(
    private readonly ufvService: UfvService,
    private readonly ufvApiService: UfvApiService,
  ) {}

  /**
   * Registra un nuevo valor UFV mediante los datos proporcionados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar UFV',
    description: 'Registra un nuevo valor de UFV para una fecha determinada.',
  })
  @ApiResponse({ status: 201, description: 'UFV registrada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una UFV para esa fecha.',
  })
  crear(@Body() dto: CreateUfvDto) {
    return this.ufvService.crear(dto, userId);
  }

  /**
   * Ejecuta la sincronización de valores UFV desde una fuente externa.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Post('sincronizar')
  @ApiOperation({
    summary: 'Sincronizar UFV',
    description: 'Obtiene y sincroniza los valores UFV desde una API externa.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sincronización ejecutada correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 500, description: 'Error durante la sincronización.' })
  sincronizar() {
    return this.ufvApiService.sincronizar();
  }

  /**
   * Obtiene los registros UFV aplicando filtros y paginación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiOperation({
    summary: 'Listar registros UFV',
    description:
      'Permite buscar, filtrar, ordenar y paginar los registros UFV.',
  })
  @ApiOkResponse({
    description: 'Listado de registros UFV obtenido correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @Get()
  listar(@Query() query: QueryUfvDto) {
    return this.ufvService.listar(query);
  }

  /**
   * Obtiene un registro UFV mediante su identificador único.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener UFV por ID',
    description: 'Busca un registro de UFV mediante su identificador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  obtenerPorId(@Param('id') id: string) {
    return this.ufvService.buscarPorId(id);
  }

  /**
   * Obtiene un registro UFV correspondiente a una fecha específica.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Get('fecha/:fecha')
  @ApiOperation({
    summary: 'Obtener UFV por fecha',
    description:
      'Busca un registro de UFV correspondiente a una fecha específica.',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha de consulta en formato AAAA-MM-DD.',
    example: '2026-11-07',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'No existe UFV para esa fecha.' })
  obtenerPorFecha(@Param('fecha') fecha: string) {
    return this.ufvService.buscarPorFecha(fecha);
  }

  /**
   * Actualiza parcialmente los datos de un registro UFV existente.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar UFV',
    description: 'Modifica los datos de un registro UFV existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'UFV actualizada correctamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateUfvDto) {
    return this.ufvService.actualizar(id, dto, userId);
  }

  /**
   * Cambia el estado de un registro UFV entre ACTIVO e INACTIVO.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de UFV',
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  cambiarEstado(@Param('id') id: string) {
    return this.ufvService.cambiarEstado(id, userId);
  }
}
