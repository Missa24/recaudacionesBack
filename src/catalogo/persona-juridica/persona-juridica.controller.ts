/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: persona-juridica.controller.ts
 * Descripción:
 * Expone los endpoints para el registro, consulta,
 * actualización y administración de personas jurídicas.
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
 * Desarrollado por: Missael Apaza
 */
@ApiTags('Catálogos / Personas Jurídicas')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('catalogos/personas-juridicas')
export class PersonaJuridicaController {
  constructor(
    private readonly personaJuridicaService: PersonaJuridicaService,
  ) {}

  /**
   * Registra una nueva persona jurídica.
   *
   * Desarrollado por: Missael Apaza
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

  /**
   * Lista las personas jurídicas con filtros y paginación.
   *
   * Desarrollado por: Missael Apaza
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

  /**
   * Busca una persona jurídica mediante su NIT.
   *
   * Desarrollado por: Missael Apaza
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

  /**
   * Consulta una persona jurídica mediante su UUID.
   *
   * Desarrollado por: Missael Apaza
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

  /**
   * Actualiza parcialmente una persona jurídica.
   *
   * Desarrollado por: Missael Apaza
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

  /**
   * Activa o inactiva una persona jurídica.
   *
   * Desarrollado por: Missael Apaza
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
