/**
 * Módulo: Catálogo - Dependencia
 * Archivo: dependencia.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización, sincronización y cambio de estado de los valores de Dependencia.
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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
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
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / Dependencias')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('dependencia')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  /*
  Nombre de la ruta: dependencia
  Método HTTP: POST
  Descripción: Registra un nuevo valor de Dependencia mediante los datos proporcionados.
  Cuerpo de la solicitud (Body):
    - CreateDependenciaDto: Datos de la dependencia a registrar (código, nombre, etc.).
  Respuestas posibles:
    - 201: Dependencia registrada correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 409: Ya existe una Dependencia para ese código.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (userId) hasta integrar el usuario autenticado desde el JWT.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una Dependencia para ese código.',
  })
  crear(
    @Body() dto: CreateDependenciaDto,
  ): Promise<DependenciaMessageResponse> {
    return this.dependenciaService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: dependencia
  Método HTTP: GET
  Descripción: Lista las dependencias aplicando filtros y paginación.
  Parámetros de consulta (Query):
    - QueryDependenciaDto: Filtros de búsqueda y paginación.
  Respuestas posibles:
    - 200: Listado de dependencias obtenido correctamente.
    - 400: Parámetros de consulta inválidos.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Respuesta envuelta en PaginatedResponse con metadatos de paginación. El método se declara como async.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async listar(
    @Query() query: QueryDependenciaDto,
  ): Promise<PaginatedResponse<DependenciaResponse>> {
    return this.dependenciaService.listar(query);
  }

  /*
  Nombre de la ruta: dependencia/:id
  Método HTTP: GET
  Descripción: Obtiene un registro de Dependencia mediante su identificador único (UUID).
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Ruta declarada después de las rutas literales para evitar conflictos de matching.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  buscarPorId(@Param('id') id: string): Promise<DependenciaResponse> {
    return this.dependenciaService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: dependencia/codigo/:codigo
  Método HTTP: GET
  Descripción: Obtiene un registro de Dependencia correspondiente a un código específico.
  Parámetros de ruta (Param):
    - codigo: Código funcional único de la dependencia.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: No existe la dependencia para ese código.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: La ruta es literal (`codigo/:codigo`) y se resuelve sin conflictos con `:id` por su prefijo fijo.
  */
  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Obtener Dependencia por código',
    description:
      'Busca un registro de dependencia correspondiente a un código específico.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código funcional único.',
    example: 'DEMO-UNI',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No existe la dependencia para ese código.',
  })
  obtenerPorCodigo(
    @Param('codigo') codigo: string,
  ): Promise<DependenciaResponse> {
    return this.dependenciaService.buscarPorCodigo(codigo);
  }

  /*
  Nombre de la ruta: dependencia/:id
  Método HTTP: PATCH
  Descripción: Actualiza los datos de una dependencia existente.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la dependencia.
  Cuerpo de la solicitud (Body):
    - UpdateDependenciaDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Dependencia actualizada correctamente.
    - 400: Datos inválidos.
    - 403: Acceso denegado.
    - 404: No se encontró la dependencia solicitada.
    - 409: Ya existe otra dependencia registrada con ese código.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Valida unicidad del código frente a otros registros.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la dependencia solicitada.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra dependencia registrada con ese código.',
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

  /*
  Nombre de la ruta: dependencia/estado/:id
  Método HTTP: PATCH
  Descripción: Cambia el estado de un registro de Dependencia entre ACTIVO e INACTIVO.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: A diferencia de otros controladores, aquí la ruta usa el patrón `estado/:id` (no `:id/estado`). No recibe body; el nuevo estado se deriva del estado actual.
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
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  cambiarEstado(@Param('id') id: string): Promise<DependenciaMessageResponse> {
    return this.dependenciaService.cambiarEstado(id, userId);
  }
}
