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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResponse } from '../../shared/interface/paginated-response.interface';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { QueryRolDto } from './dto/query-rol.dto';
import {
  RolCreateResponse,
  RolDetalleResponse,
  RolEstadoResponse,
  RolListadoResponse,
} from './interfaces/rol-response.interface';
import { RolService } from './rol.service';

/** UUID temporal del responsable. Sustituir por el usuario autenticado al integrar JWT. */
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Recibe solicitudes de rol y delega las reglas de negocio al servicio.
 * Desarrollado por: Oscar Canchari.
 */
@ApiTags('Seguridad / Rol')
// Al integrar autenticación, importar y habilitar ApiBearerAuth, UseGuards y AuthGuard.
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('rol')
export class RolController {
  constructor(private readonly servicio: RolService) {}

  /**
   * POST /api/rol
   * Registra un rol validando sus datos y la unicidad de nombre y código.
   * Devuelve 201; valida datos (400) y existencia/unicidad cuando corresponde.
   */
  @Post()
  @ApiOperation({
    summary: 'Crear rol',
    description:
      'Registra un rol validando sus datos y la unicidad de nombre y código.',
  })
  @ApiBody({ type: CreateRolDto })
  @ApiResponse({
    status: 201,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        message: 'Registro creado correctamente.',
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({ status: 409, description: 'Nombre o código duplicado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  crear(@Body() dto: CreateRolDto): Promise<RolCreateResponse> {
    return this.servicio.crear(dto, userId);
  }

  /**
   * GET /api/rol
   * Lista por nombre o código con paginación, estado, fechas y ordenamiento.
   * Devuelve 200; valida datos (400) y existencia/unicidad cuando corresponde.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar rol',
    description:
      'Lista por nombre o código con paginación, estado, fechas y ordenamiento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            nombre: 'Administrador',
            codigo: 'ADMINISTRADOR',
            estado: 'ACTIVO',
            responsable_creacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
            fecha_creacion: '2026-11-11T04:00:00.000Z',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  listar(
    @Query() query: QueryRolDto,
  ): Promise<PaginatedResponse<RolListadoResponse>> {
    return this.servicio.listar(query);
  }

  /**
   * GET /api/rol/buscar/:valor
   * Consulta el detalle por UUID o código exacto.
   * Devuelve 200; valida datos (400) y existencia/unicidad cuando corresponde.
   */
  @Get('buscar/:valor')
  @ApiOperation({
    summary: 'Buscar rol',
    description: 'Consulta el detalle por UUID o código exacto.',
  })
  @ApiParam({ name: 'valor', description: 'UUID o código.', type: String })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'Administrador',
        codigo: 'ADMINISTRADOR',
        estado: 'ACTIVO',
        responsable_creacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
        fecha_creacion: '2026-11-11T04:00:00.000Z',
        descripcion: 'Descripción de las funciones.',
        responsable_actualizacion: null,
        fecha_actualizacion: '2026-11-11T04:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  buscarPorIdentificador(
    @Param('valor') valor: string,
  ): Promise<RolDetalleResponse> {
    return this.servicio.buscarPorIdentificador(valor);
  }

  /**
   * PATCH /api/rol/:id
   * Actualiza los campos enviados validando nombre y código únicos.
   * Devuelve 200; valida datos (400) y existencia/unicidad cuando corresponde.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Editar rol',
    description:
      'Actualiza los campos enviados validando nombre y código únicos.',
  })
  @ApiBody({ type: UpdateRolDto })
  @ApiParam({ name: 'id', description: 'UUID del registro.', type: String })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'Administrador',
        codigo: 'ADMINISTRADOR',
        estado: 'ACTIVO',
        responsable_creacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
        fecha_creacion: '2026-11-11T04:00:00.000Z',
        descripcion: 'Descripción de las funciones.',
        responsable_actualizacion: null,
        fecha_actualizacion: '2026-11-11T04:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  @ApiResponse({ status: 409, description: 'Nombre o código duplicado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  editar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolDto,
  ): Promise<RolDetalleResponse> {
    return this.servicio.editar(id, dto, userId);
  }

  /**
   * PATCH /api/rol/:id/estado
   * Alterna ACTIVO e INACTIVO sin recibir body.
   * Devuelve 200; valida datos (400) y existencia/unicidad cuando corresponde.
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Dar de alta o baja a rol',
    description: 'Alterna ACTIVO e INACTIVO sin recibir body.',
  })
  @ApiParam({ name: 'id', description: 'UUID del registro.', type: String })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        message: 'Registro dado de baja correctamente.',
        id: '550e8400-e29b-41d4-a716-446655440000',
        estado: 'INACTIVO',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RolEstadoResponse> {
    return this.servicio.cambiarEstado(id, userId);
  }
}
