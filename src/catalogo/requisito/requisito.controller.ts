/**
 * Módulo: Catálogo - Requisito
 * Archivo: requisito.controller.ts
 * Descripción:
 * Expone los endpoints REST para la gestión del catálogo de requisitos.
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
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RequisitoService } from './requisito.service';
import { CreateRequisitoDto } from './dto/create-requisito.dto';
import { UpdateRequisitoDto } from './dto/update-requisito.dto';
import { QueryRequisitoDto } from './dto/query-requisito.dto';
import {
  RequisitoCreateResponse,
  RequisitoMessageResponse,
  RequisitoResponse,
} from './interface/requisito-response.interface';

// NOTA: reemplaza este id por el usuario autenticado (req.user.idUsuario)
const idUsuario = '00000000-0000-0000-0000-000000000000';
/**
 * Controlador: RequisitoController
 * Descripción:
 * Define las rutas para crear, listar, consultar, actualizar y cambiar
 * el estado de los requisitos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogo - Requisito')
@ApiBearerAuth('jwt')
@Controller('requisito')
export class RequisitoController {
  constructor(private readonly requisitoService: RequisitoService) {}

  /*
    Nombre de la ruta: requisito
    Método HTTP: POST
    Descripción: Registra un nuevo requisito en el catálogo.
    Body:
      - CreateRequisitoDto (codigo, descripcion)
    Respuestas posibles:
      - 201: Requisito registrado correctamente.
      - 400: Datos inválidos.
      - 409: Ya existe un Requisito con ese código.
      - 500: No se pudo guardar el registro.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar un requisito',
    description:
      'Registra un nuevo requisito validando la unicidad del código.',
  })
  @ApiBody({ type: CreateRequisitoDto })
  @ApiResponse({
    status: 201,
    description: 'Requisito registrado correctamente.',
    type: Object,
    schema: {
      example: {
        message: 'Requisito registrado correctamente',
        id_requisito: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un Requisito con ese código.',
  })
  @ApiResponse({
    status: 500,
    description: 'No se pudo guardar el registro.',
  })
  crear(@Body() dto: CreateRequisitoDto): Promise<RequisitoCreateResponse> {
    return this.requisitoService.crear(dto, idUsuario);
  }

  /*
    Nombre de la ruta: requisito
    Método HTTP: GET
    Descripción: Obtiene el listado paginado de requisitos aplicando filtros,
                 búsqueda y ordenamiento.
    Query:
      - QueryRequisitoDto (page, limit, search, status, startDate, endDate,
        sortBy, sortOrder)
    Respuestas posibles:
      - 200: Listado paginado de requisitos.
      - 400: Rango de fechas inválido.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  @Get()
  @ApiOperation({
    summary: 'Listar requisitos',
    description:
      'Obtiene el listado paginado de requisitos con filtros, búsqueda y ordenamiento.',
  })
  @ApiQuery({ type: QueryRequisitoDto })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de requisitos.',
  })
  @ApiResponse({
    status: 400,
    description: 'Rango de fechas inválido.',
  })
  listar(@Query() query: QueryRequisitoDto) {
    return this.requisitoService.listar(query);
  }

  /*
    Nombre de la ruta: requisito/codigo/:codigo
    Método HTTP: GET
    Descripción: Obtiene un requisito activo por su código.
    Parámetros de ruta (Param):
      - codigo: Código del requisito a buscar.
    Respuestas posibles:
      - 200: Registro encontrado.
      - 404: No existe un Requisito activo para ese código.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
    Notas adicionales: Se declara antes de `:id` para que la ruta literal no
                       sea capturada por el parámetro genérico.
  */
  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Buscar requisito por código',
    description:
      'Obtiene un requisito activo y no eliminado lógicamente por su código.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código del requisito a buscar.',
    example: 'REQ-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un Requisito activo para ese código.',
  })
  buscarPorCodigo(@Param('codigo') codigo: string): Promise<RequisitoResponse> {
    return this.requisitoService.buscarPorCodigo(codigo);
  }

  /*
    Nombre de la ruta: requisito/:id
    Método HTTP: GET
    Descripción: Obtiene un requisito por su identificador UUID.
    Parámetros de ruta (Param):
      - id: Identificador del requisito.
    Respuestas posibles:
      - 200: Registro encontrado.
      - 400: UUID inválido.
      - 404: No existe un Requisito con ese Id.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar requisito por Id',
    description: 'Obtiene un requisito por su identificador UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del requisito.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado.',
  })
  @ApiResponse({ status: 400, description: 'UUID inválido.' })
  @ApiResponse({
    status: 404,
    description: 'No existe un Requisito con ese Id.',
  })
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RequisitoResponse> {
    return this.requisitoService.buscarPorId(id);
  }

  /*
    Nombre de la ruta: requisito/:id
    Método HTTP: PUT
    Descripción: Actualiza parcialmente un requisito existente.
    Parámetros de ruta (Param):
      - id: Identificador del requisito.
    Body:
      - UpdateRequisitoDto (codigo?, descripcion?)
    Respuestas posibles:
      - 200: Requisito actualizado correctamente.
      - 400: Datos inválidos / requisito inactivo.
      - 404: No se encontró el Requisito solicitado.
      - 409: Ya existe otro Requisito con ese código.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar requisito',
    description:
      'Actualiza parcialmente un requisito verificando unicidad de código y estado ACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del requisito.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiBody({ type: UpdateRequisitoDto })
  @ApiResponse({
    status: 200,
    description: 'Requisito actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos / requisito inactivo.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el Requisito solicitado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otro Requisito con ese código.',
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequisitoDto,
  ): Promise<RequisitoMessageResponse> {
    return this.requisitoService.actualizar(id, dto, idUsuario);
  }

  /*
    Nombre de la ruta: requisito/:id/estado
    Método HTTP: PATCH
    Descripción: Cambia el estado de un requisito entre ACTIVO e INACTIVO.
    Parámetros de ruta (Param):
      - id: Identificador del requisito.
    Respuestas posibles:
      - 200: Registro del Requisito activado/inactivado correctamente.
      - 404: No existe un Requisito con esa identificación.
      - 500: No se pudo cambiar el estado del registro.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado del requisito',
    description:
      'Alterna el estado del requisito entre ACTIVO e INACTIVO, gestionando la baja lógica.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del requisito.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro del Requisito activado/inactivado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un Requisito con esa identificación.',
  })
  @ApiResponse({
    status: 500,
    description: 'No se pudo cambiar el estado del registro.',
  })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RequisitoMessageResponse> {
    return this.requisitoService.cambiarEstado(id, idUsuario);
  }
}
