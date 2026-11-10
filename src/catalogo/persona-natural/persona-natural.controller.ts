/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: persona-natural.controller.ts
 * Descripción:
 * Gestiona los endpoints para registrar, consultar, listar,
 * actualizar y cambiar el estado de las personas naturales.
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

import { PersonaNaturalService } from './persona-natural.service';

import { CreatePersonaNaturalDto } from './dto/create-persona-natural.dto';
import { UpdatePersonaNaturalDto } from './dto/update-persona-natural.dto';
import { QueryPersonaNaturalDto } from './dto/query-persona-natural.dto';
import { BuscarPersonaNaturalDto } from './dto/buscar-persona-natural.dto';

import {
  BuscarPersonaNaturalResponse,
  PersonaNaturalCreateResponse,
  PersonaNaturalMessageResponse,
  PersonaNaturalResponse,
} from './interface/persona-natural-response.interface';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/**
 * Identificador temporal del usuario responsable de las operaciones.
 * Será reemplazado por el usuario autenticado cuando se integre
 * el módulo de seguridad.
 */
const idUsuario = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador encargado de gestionar las solicitudes HTTP
 * del catálogo de personas naturales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / Personas Naturales')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('catalogos/personas-naturales')
export class PersonaNaturalController {
  /**
   * Inicializa el servicio de personas naturales.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  constructor(private readonly personaNaturalService: PersonaNaturalService) {}

  /*
  Nombre de la ruta: catalogos/personas-naturales
  Método HTTP: POST
  Descripción: Registra una nueva persona natural validando datos de entrada y que la fecha de nacimiento no sea posterior a la actual.
  Cuerpo de la solicitud (Body):
    - CreatePersonaNaturalDto: Datos de la persona natural a registrar.
  Respuestas posibles:
    - 201: Persona natural registrada correctamente.
    - 400: Datos de entrada inválidos o fecha de nacimiento posterior a la actual.
    - 403: Acceso denegado.
    - 409: Ya existe una persona registrada con esos datos documentales.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (idUsuario) hasta integrar el usuario autenticado desde el JWT. El método se declara como async.
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar una persona natural',
  })
  @ApiResponse({
    status: 201,
    description: 'Persona natural registrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos o fecha de nacimiento posterior a la actual.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe una persona registrada con esos datos documentales.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async crear(
    @Body() dto: CreatePersonaNaturalDto,
  ): Promise<PersonaNaturalCreateResponse> {
    return this.personaNaturalService.crear(dto, idUsuario);
  }

  /*
  Nombre de la ruta: catalogos/personas-naturales
  Método HTTP: GET
  Descripción: Lista las personas naturales aplicando filtros y paginación.
  Parámetros de consulta (Query):
    - QueryPersonaNaturalDto: Filtros de búsqueda y paginación.
  Respuestas posibles:
    - 200: Listado de personas naturales obtenido correctamente.
    - 400: Parámetros de consulta inválidos.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Respuesta envuelta en PaginatedResponse con metadatos de paginación. El método se declara como async.
  */
  @Get()
  @ApiOperation({
    summary: 'Listar personas naturales con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de personas naturales obtenido correctamente.',
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
    @Query() query: QueryPersonaNaturalDto,
  ): Promise<PaginatedResponse<PersonaNaturalResponse>> {
    return this.personaNaturalService.listar(query);
  }

  /*
  Nombre de la ruta: catalogos/personas-naturales/buscar
  Método HTTP: GET
  Descripción: Busca una persona natural mediante sus datos de identidad documental.
  Parámetros de consulta (Query):
    - BuscarPersonaNaturalDto: Criterio de búsqueda (datos documentales).
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
    summary: 'Buscar una persona natural por identidad documental',
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
  async buscarPorDocumento(
    @Query() dto: BuscarPersonaNaturalDto,
  ): Promise<BuscarPersonaNaturalResponse> {
    return this.personaNaturalService.buscarPorDocumento(dto);
  }

  /*
  Nombre de la ruta: catalogos/personas-naturales/:id
  Método HTTP: GET
  Descripción: Consulta una persona natural mediante su identificador UUID.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la persona natural.
  Respuestas posibles:
    - 200: Persona natural encontrada correctamente.
    - 400: El identificador proporcionado no es un UUID válido.
    - 403: Acceso denegado.
    - 404: No se encontró la persona natural solicitada.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: La validación del UUID se realiza con ParseUUIDPipe. El método se declara como async.
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una persona natural por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la persona natural',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona natural encontrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona natural solicitada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonaNaturalResponse> {
    return this.personaNaturalService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: catalogos/personas-naturales/:id
  Método HTTP: PATCH
  Descripción: Actualiza los datos de una persona natural existente.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la persona natural.
  Cuerpo de la solicitud (Body):
    - UpdatePersonaNaturalDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Persona natural actualizada correctamente.
    - 400: Datos inválidos, fecha de nacimiento posterior a la actual o persona inactiva.
    - 403: Acceso denegado.
    - 404: No se encontró la persona natural solicitada.
    - 409: Ya existe otra persona registrada con esos datos documentales.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No se permite actualizar personas inactivas. La validación del UUID se realiza con ParseUUIDPipe. El método se declara como async.
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una persona natural',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la persona natural',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona natural actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, fecha de nacimiento posterior a la actual o persona inactiva.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona natural solicitada.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe otra persona registrada con esos datos documentales.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonaNaturalDto,
  ): Promise<PersonaNaturalMessageResponse> {
    return this.personaNaturalService.actualizar(id, dto, idUsuario);
  }

  /*
  Nombre de la ruta: catalogos/personas-naturales/:id/estado
  Método HTTP: PATCH
  Descripción: Activa o inactiva una persona natural alternando su estado entre ACTIVO e INACTIVO.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la persona natural.
  Respuestas posibles:
    - 200: Estado de la persona natural actualizado correctamente.
    - 400: El identificador proporcionado no es un UUID válido.
    - 403: Acceso denegado.
    - 404: No se encontró la persona natural solicitada.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No recibe body; el nuevo estado se deriva del estado actual. La validación del UUID se realiza con ParseUUIDPipe. El método se declara como async.
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Activar o inactivar una persona natural',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la persona natural',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la persona natural actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona natural solicitada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonaNaturalMessageResponse> {
    return this.personaNaturalService.cambiarEstado(id, idUsuario);
  }
}
