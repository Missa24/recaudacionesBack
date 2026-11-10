/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: cuenta-bancaria.controller.ts
 * Descripción:
 * Expone los endpoints para el registro, consulta, listado,
 * actualización y cambio de estado de las cuentas bancarias.
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

import { CuentaBancariaService } from './cuenta-bancaria.service';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';
import { QueryCuentaBancariaDto } from './dto/query-cuenta-bancaria.dto';
import {
  CuentaBancariaCreateResponse,
  CuentaBancariaMessageResponse,
  CuentaBancariaResponse,
} from './interfaces/cuenta-bancaria-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

// Identificador temporal del usuario responsable de las operaciones.
const idUsuario = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador encargado de gestionar las solicitudes HTTP
 * del catálogo de cuentas bancarias.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / Cuentas bancarias')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('cuenta-bancaria')
export class CuentaBancariaController {
  constructor(private readonly cuentaBancariaService: CuentaBancariaService) {}

  /**
   * Registra una nueva cuenta bancaria.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar una cuenta bancaria',
    description:
      'Registra una nueva cuenta bancaria validando banco, dependencia y unicidad.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cuenta bancaria registrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description:
      'El número de cuenta ya se encuentra registrado para este banco.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crear(
    @Body() dto: CreateCuentaBancariaDto,
  ): Promise<CuentaBancariaCreateResponse> {
    return this.cuentaBancariaService.crear(dto, idUsuario);
  }

  /**
   * Lista las cuentas bancarias aplicando filtros y paginación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Get()
  @ApiOperation({
    summary: 'Listar cuentas bancarias con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de cuentas bancarias obtenido correctamente.',
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
    @Query() query: QueryCuentaBancariaDto,
  ): Promise<PaginatedResponse<CuentaBancariaResponse>> {
    return this.cuentaBancariaService.listar(query);
  }

  /**
   * Consulta una cuenta bancaria mediante su identificador UUID.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una cuenta bancaria por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la cuenta bancaria.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta bancaria encontrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la cuenta bancaria solicitada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CuentaBancariaResponse> {
    return this.cuentaBancariaService.buscarPorId(id);
  }

  /**
   * Actualiza parcialmente una cuenta bancaria existente.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una cuenta bancaria',
    description:
      'Modifica los datos de una cuenta bancaria existente validando referencias y unicidad.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la cuenta bancaria.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta bancaria actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos o intento de actualizar una cuenta bancaria inactiva.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la cuenta bancaria solicitada.',
  })
  @ApiResponse({
    status: 409,
    description:
      'El número de cuenta ya se encuentra registrado para este banco.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCuentaBancariaDto,
  ): Promise<CuentaBancariaMessageResponse> {
    return this.cuentaBancariaService.actualizar(id, dto, idUsuario);
  }

  /**
   * Activa o inactiva una cuenta bancaria.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Activar o inactivar una cuenta bancaria',
    description: 'Alterna el estado del registro entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la cuenta bancaria.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la cuenta bancaria actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador proporcionado no es un UUID válido.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la cuenta bancaria solicitada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CuentaBancariaMessageResponse> {
    return this.cuentaBancariaService.cambiarEstado(id, idUsuario);
  }
}
