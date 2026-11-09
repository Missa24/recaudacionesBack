/**
 * Módulo: Catálogo - Dependencia
 * Archivo: dependencia.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización, sincronización y cambio de estado de los valores de Dependencia.
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
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryDependenciaDto } from './dto/query-dependencia.dto';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import {
  DependenciaMessageResponse,
  DependenciaResponse,
} from './interface/dependencia-response.interface';

// Id temporal
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: DependenciaController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los valores de Dependencia
 * y delega su procesamiento a los servicios correspondientes.
 *
 * Desarrollado por: Missael Apaza
 */
@ApiTags('Catálogos - Dependencia')
@Controller('dependencia')
@ApiTags('Catálogos / Dependencias')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  /**
   * Registra un nuevo valor de Dependencia mediante los datos proporcionados.
   *
   * Desarrollado por: Missael Apaza
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar Dependencia',
    description: 'Registra un nuevo valor de Dependencia',
  })
  @ApiResponse({
    status: 201,
    description: 'Dependencia registrada correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una Depedencia para ese código.',
  })
  crear(
    @Body() dto: CreateDependenciaDto,
  ): Promise<DependenciaMessageResponse> {
    return this.dependenciaService.crear(dto, userId);
  }

  /**
   * Lista las dependencias aplicando filtros y paginación.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get()
  @ApiOperation({
    summary: 'Listar dependencias con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de dependencias obtenido correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async listar(
    @Query() query: QueryDependenciaDto,
  ): Promise<PaginatedResponse<DependenciaResponse>> {
    return this.dependenciaService.listar(query);
  }
  /**
   * Obtiene un registro de Dependencia mediante su identificador único.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener Dependencia por ID',
    description: 'Busca un registro de Dependencia mediante su identificador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  buscarPorId(@Param('id') id: string): Promise<DependenciaResponse> {
    return this.dependenciaService.buscarPorId(id);
  }

  /**
   * Obtiene un registro de Dependencia correspondiente a un código especifico.
   *
   * Desarrollado por: Missael Apaza
   */
  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Obtener Dependencia por código',
    description:
      'Busca un registro de dependencia correspondiente a un código específica.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código funcional único.',
    example: 'DEMO-UNI',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'No existe la dependencia para ese codigo.',
  })
  obtenerPorCodigo(
    @Param('fecha') fecha: string,
  ): Promise<DependenciaResponse> {
    return this.dependenciaService.buscarPorCodigo(fecha);
  }

  /**
   * Actualiza los datos de una persona natural existente.
   *
   * Desarrollado por: Missael Apaza
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una dependencia',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la dependencia',
  })
  @ApiResponse({
    status: 200,
    description: 'Dependencia actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la dependencia solicitada.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra dependencia registrada con ese codigo.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateDependenciaDto,
  ): Promise<DependenciaMessageResponse> {
    return this.dependenciaService.actualizar(id, dto, userId);
  }
  /**
   * Cambia el estado de un registro de Dependencia entre ACTIVO e INACTIVO.
   *
   * Desarrollado por: Missael Apaza
   */
  @Patch('estado/:id')
  @ApiOperation({
    summary: 'Cambiar estado de Dependencia',
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
  cambiarEstado(@Param('id') id: string): Promise<DependenciaMessageResponse> {
    return this.dependenciaService.cambiarEstado(id, userId);
  }
}
