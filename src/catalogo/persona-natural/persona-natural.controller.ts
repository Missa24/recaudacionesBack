/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: persona-natural.controller.ts
 * Descripción:
 * Gestiona los endpoints para registrar, consultar, listar,
 * actualizar y cambiar el estado de las personas naturales.
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
const id_usuario = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador encargado de gestionar las solicitudes HTTP
 * del catálogo de personas naturales.
 *
 * Desarrollado por: Missael Apaza
 */
@ApiTags('Catálogos - Personas Naturales')
@Controller('catalogos/personas-naturales')
export class PersonaNaturalController {
  /**
   * Inicializa el servicio de personas naturales.
   *
   * Desarrollado por: Missael Apaza
   */
  constructor(private readonly personaNaturalService: PersonaNaturalService) {}

  /**
   * Registra una nueva persona natural.
   *
   * Desarrollado por: Missael Apaza
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
    return this.personaNaturalService.crear(dto, id_usuario);
  }

  /**
   * Lista las personas naturales aplicando filtros y paginación.
   *
   * Desarrollado por: Missael Apaza
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
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async listar(
    @Query() query: QueryPersonaNaturalDto,
  ): Promise<PaginatedResponse<PersonaNaturalResponse>> {
    return this.personaNaturalService.listar(query);
  }

  /**
   * Busca una persona natural mediante sus datos de identidad documental.
   *
   * Desarrollado por: Missael Apaza
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
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async buscarPorDocumento(
    @Query() dto: BuscarPersonaNaturalDto,
  ): Promise<BuscarPersonaNaturalResponse> {
    return this.personaNaturalService.buscarPorDocumento(dto);
  }

  /**
   * Consulta una persona natural mediante su identificador UUID.
   *
   * Desarrollado por: Missael Apaza
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

  /**
   * Actualiza los datos de una persona natural existente.
   *
   * Desarrollado por: Missael Apaza
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
    return this.personaNaturalService.actualizar(id, dto, id_usuario);
  }

  /**
   * Activa o inactiva una persona natural.
   *
   * Desarrollado por: Missael Apaza
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
    return this.personaNaturalService.cambiarEstado(id, id_usuario);
  }
}
