/**
 * Módulo: Catálogo - Banco
 * Archivo: banco.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización y cambio de estado de los valores de Banco.
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

import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { QueryBancoDto } from './dto/query-banco.dto';
import {
  BancoMessageResponse,
  BancoResponse,
} from './interface/banco-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: BancoController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los valores de Banco
 * y delega su procesamiento a los servicios correspondientes.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / Bancos')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('banco')
export class BancoController {
  constructor(private readonly bancoService: BancoService) {}

  /*
  Nombre de la ruta: banco
  Método HTTP: POST
  Descripción: Registra un nuevo valor de Banco mediante los datos proporcionados.
  Cuerpo de la solicitud (Body):
    - CreateBancoDto: Datos del banco a registrar (nombre, etc.).
  Respuestas posibles:
    - 201: Banco registrado correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 409: Ya existe un Banco con ese mismo nombre.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (userId) hasta integrar el usuario autenticado desde el JWT.
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar Banco',
    description: 'Registra un nuevo valor de Banco.',
  })
  @ApiResponse({
    status: 201,
    description: 'Banco registrado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un Banco con ese mismo nombre.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crear(@Body() dto: CreateBancoDto): Promise<BancoMessageResponse> {
    return this.bancoService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: banco
  Método HTTP: GET
  Descripción: Lista los bancos aplicando filtros y paginación.
  Parámetros de consulta (Query):
    - QueryBancoDto: Filtros de búsqueda y paginación.
  Respuestas posibles:
    - 200: Listado de bancos obtenido correctamente.
    - 400: Parámetros de consulta inválidos.
    - 403: Acceso denegado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Respuesta envuelta en PaginatedResponse con metadatos de paginación.
  */
  @Get()
  @ApiOperation({
    summary: 'Listar bancos con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de bancos obtenido correctamente.',
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
    @Query() query: QueryBancoDto,
  ): Promise<PaginatedResponse<BancoResponse>> {
    return this.bancoService.listar(query);
  }

  /*
  Nombre de la ruta: banco/nombre/:nombre
  Método HTTP: GET
  Descripción: Obtiene un registro de Banco correspondiente a un nombre específico.
  Parámetros de ruta (Param):
    - nombre: Nombre del banco a buscar.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: No existe un Banco activo para ese nombre.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se declara antes de `:id` para que la ruta literal no sea capturada por el parámetro genérico.
  */
  @Get('nombre/:nombre')
  @ApiOperation({
    summary: 'Obtener Banco por nombre',
    description:
      'Busca un registro de Banco correspondiente a un nombre específico.',
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del banco.',
    example: 'Banco Unión',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No existe un Banco activo para ese nombre.',
  })
  buscarPorNombre(@Param('nombre') nombre: string): Promise<BancoResponse> {
    return this.bancoService.buscarPorNombre(nombre);
  }

  /*
  Nombre de la ruta: banco/:id
  Método HTTP: GET
  Descripción: Obtiene un registro de Banco mediante su identificador único (UUID).
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
    summary: 'Obtener Banco por ID',
    description: 'Busca un registro de Banco mediante su identificador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  buscarPorId(@Param('id') id: string): Promise<BancoResponse> {
    return this.bancoService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: banco/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente un registro de Banco existente.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Cuerpo de la solicitud (Body):
    - UpdateBancoDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Banco actualizado correctamente.
    - 400: Datos inválidos o intento de actualizar un banco inactivo.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
    - 409: Ya existe un Banco registrado con ese nombre.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No se permite actualizar registros inactivos.
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar Banco',
    description: 'Modifica los datos de un registro de Banco existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Banco actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o intento de actualizar un banco inactivo.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un Banco registrado con ese nombre.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateBancoDto,
  ): Promise<BancoMessageResponse> {
    return this.bancoService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: banco/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia el estado de un registro de Banco entre ACTIVO e INACTIVO.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
    - 500: Error interno del servidor.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No recibe body; el nuevo estado se deriva del estado actual (alterna entre ACTIVO e INACTIVO).
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de Banco',
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
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  cambiarEstado(@Param('id') id: string): Promise<BancoMessageResponse> {
    return this.bancoService.cambiarEstado(id, userId);
  }
}
