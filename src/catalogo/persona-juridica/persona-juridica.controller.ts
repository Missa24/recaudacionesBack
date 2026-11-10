/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: persona-juridica.controller.ts
 * Descripción:
 * Expone los endpoints para el registro, consulta,
 * actualización y administración de personas jurídicas.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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

import { PersonaJuridicaService } from './persona-juridica.service';

import { CreatePersonaJuridicaDto } from './dto/create-persona-juridica.dto';
import { UpdatePersonaJuridicaDto } from './dto/update-persona-juridica.dto';
import { QueryPersonaJuridicaDto } from './dto/query-persona-juridica.dto';
import { BuscarPersonaJuridicaDto } from './dto/buscar-persona-juridica.dto';

import {
  BuscarPersonaJuridicaResponse,
  PersonaJuridicaCreateResponse,
  PersonaJuridicaMessageResponse,
  PersonaJuridicaResponse,
} from './interface/persona-juridica-response.interface';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/* ID TEMPORAL */
const idUsuario = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador encargado de gestionar las solicitudes HTTP
 * del catálogo de personas jurídicas.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / Personas Jurídicas')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('catalogos/personas-juridicas')
export class PersonaJuridicaController {
  constructor(
    private readonly personaJuridicaService: PersonaJuridicaService,
  ) {}

  /*
  Nombre de la ruta: catalogos/personas-juridicas
  Método HTTP: POST
  Descripción: Registra una nueva persona jurídica validando la unicidad del NIT.
  Cuerpo de la solicitud (Body):
    - CreatePersonaJuridicaDto: Datos de la persona jurídica a registrar.
  Respuestas posibles:
    - 201: Persona jurídica registrada correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 409: Ya existe una persona jurídica registrada con ese NIT.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (idUsuario) hasta integrar el usuario autenticado desde el JWT. El método se declara como async.
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar una persona jurídica',
  })
  @ApiResponse({
    status: 201,
    description: 'Persona jurídica registrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una persona jurídica registrada con ese NIT.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async crear(
    @Body() dto: CreatePersonaJuridicaDto,
  ): Promise<PersonaJuridicaCreateResponse> {
    return this.personaJuridicaService.crear(dto, idUsuario);
  }

  /*
  Nombre de la ruta: catalogos/personas-juridicas
  Método HTTP: GET
  Descripción: Lista las personas jurídicas con filtros y paginación.
  Parámetros de consulta (Query):
    - QueryPersonaJuridicaDto: Filtros de búsqueda y paginación.
  Respuestas posibles:
    - 200: Listado de personas jurídicas obtenido correctamente.
    - 400: Parámetros de consulta inválidos.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Respuesta envuelta en PaginatedResponse con metadatos de paginación. El método se declara como async.
  */
  @Get()
  @ApiOperation({
    summary: 'Listar personas jurídicas con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de personas jurídicas obtenido correctamente.',
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
    @Query() query: QueryPersonaJuridicaDto,
  ): Promise<PaginatedResponse<PersonaJuridicaResponse>> {
    return this.personaJuridicaService.listar(query);
  }

  /*
  Nombre de la ruta: catalogos/personas-juridicas/buscar
  Método HTTP: GET
  Descripción: Busca una persona jurídica mediante su NIT.
  Parámetros de consulta (Query):
    - BuscarPersonaJuridicaDto: Criterio de búsqueda (NIT).
  Respuestas posibles:
    - 200: Búsqueda realizada correctamente.
    - 400: Parámetros de búsqueda inválidos.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se declara antes de `:id` para que la ruta literal `buscar` no sea capturada por el parámetro genérico. El método se declara como async.
  */
  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar una persona jurídica por NIT',
  })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda realizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de búsqueda inválidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async buscarPorNit(
    @Query() dto: BuscarPersonaJuridicaDto,
  ): Promise<BuscarPersonaJuridicaResponse> {
    return this.personaJuridicaService.buscarPorNit(dto);
  }

  /*
  Nombre de la ruta: catalogos/personas-juridicas/:id
  Método HTTP: GET
  Descripción: Consulta una persona jurídica mediante su identificador UUID.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la persona jurídica.
  Respuestas posibles:
    - 200: Persona jurídica encontrada correctamente.
    - 400: El identificador proporcionado no es un UUID válido.
    - 403: Acceso denegado.
    - 404: No se encontró la persona jurídica solicitada.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: La validación del UUID se realiza con ParseUUIDPipe. El método se declara como async.
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una persona jurídica por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la persona jurídica',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona jurídica encontrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona jurídica solicitada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonaJuridicaResponse> {
    return this.personaJuridicaService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: catalogos/personas-juridicas/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente una persona jurídica existente.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la persona jurídica.
  Cuerpo de la solicitud (Body):
    - UpdatePersonaJuridicaDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Persona jurídica actualizada correctamente.
    - 400: Datos inválidos o intento de actualizar una persona jurídica inactiva.
    - 403: Acceso denegado.
    - 404: No se encontró la persona jurídica solicitada.
    - 409: Ya existe otra persona jurídica registrada con ese NIT.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No se permite actualizar registros inactivos. La validación del UUID se realiza con ParseUUIDPipe. El método se declara como async.
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una persona jurídica',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la persona jurídica',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona jurídica actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos o intento de actualizar una persona jurídica inactiva.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona jurídica solicitada.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra persona jurídica registrada con ese NIT.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonaJuridicaDto,
  ): Promise<PersonaJuridicaMessageResponse> {
    return this.personaJuridicaService.actualizar(id, dto, idUsuario);
  }

  /*
  Nombre de la ruta: catalogos/personas-juridicas/:id/estado
  Método HTTP: PATCH
  Descripción: Activa o inactiva una persona jurídica alternando su estado entre ACTIVO e INACTIVO.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la persona jurídica.
  Respuestas posibles:
    - 200: Estado de la persona jurídica actualizado correctamente.
    - 400: El identificador proporcionado no es un UUID válido.
    - 403: Acceso denegado.
    - 404: No se encontró la persona jurídica solicitada.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No recibe body; el nuevo estado se deriva del estado actual. La validación del UUID se realiza con ParseUUIDPipe. El método se declara como async.
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Activar o inactivar una persona jurídica',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la persona jurídica',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la persona jurídica actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona jurídica solicitada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonaJuridicaMessageResponse> {
    return this.personaJuridicaService.cambiarEstado(id, idUsuario);
  }
}
