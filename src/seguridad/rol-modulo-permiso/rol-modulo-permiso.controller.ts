/**

Módulo: Seguridad - RolModuloPermiso
Archivo: rol-modulo-permiso.controller.ts
Descripción:
Expone los endpoints para la gestión de asignaciones de permisos
entre roles y módulos.

*/

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { RolModuloPermisoService } from './rol-modulo-permiso.service';

import { CreateRolModuloPermisoDto } from './dto/create-rol-modulo-permiso.dto';
import { UpdateRolModuloPermisoDto } from './dto/update-rol-modulo-permiso.dto';
import { QueryRolModuloPermisoDto } from './dto/query-rol-modulo-permiso.dto';
import { ReemplazarPermisosRolModuloDto } from './dto/reemplazar-permisos-rol-modulo.dto';
import { AsignarPermisosRolModuloDto } from './dto/asignar-permisos-rol-modulo.dto';

import {
  RolModuloPermisoResponse,
  RolModuloPermisoMessageResponse,
  CatalogoPermisosResponse,
  RolModulosPermisosResponse,
} from './interface/rol-modulo-permiso-response.interface';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const idUsuario = '8b461287-8416-412e-84e7-b5c77615ea2a';
@Controller('rol-modulo-permiso')
export class RolModuloPermisoController {
  constructor(
    private readonly rolModuloPermisoService: RolModuloPermisoService,
  ) {}

  /**
   * Endpoint 1
   * POST /rol-modulo-permiso
   * Crear una asignación de permiso.
   */
  @Post()
  async crear(
    @Body() dto: CreateRolModuloPermisoDto,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.crear(dto, idUsuario);
  }

  /**
   * Endpoint 2
   * GET /rol-modulo-permiso
   * Listar asignaciones con filtros y paginación.
   */
  @Get()
  async listar(
    @Query() query: QueryRolModuloPermisoDto,
  ): Promise<PaginatedResponse<RolModuloPermisoResponse>> {
    return this.rolModuloPermisoService.listar(query);
  }

  /**
   * Endpoint 6
   * GET /rol-modulo-permiso/catalogo
   * Obtener catálogo de módulos y permisos activos.
   *
   * IMPORTANTE: debe ir antes de GET /:id para que NestJS
   * no confunda "catalogo" con un id.
   */
  @Get('catalogo')
  async obtenerCatalogo(): Promise<CatalogoPermisosResponse> {
    return this.rolModuloPermisoService.obtenerCatalogo();
  }

  /**
   * Endpoint 7
   * GET /rol-modulo-permiso/rol/:rolId/permisos
   * Obtener módulos y permisos agrupados por rol.
   *
   * También debe declararse antes de rutas más genéricas como
   * /rol/:rolId para evitar colisiones.
   */
  @Get('rol/:rolId/permisos')
  async obtenerPorRol(
    @Param('rolId') rolId: string,
  ): Promise<RolModulosPermisosResponse> {
    return this.rolModuloPermisoService.obtenerPorRol(rolId);
  }

  /**
   * Endpoint 8
   * POST /rol-modulo-permiso/rol/:rolId/modulo/:moduloId/asignar
   * Asignar múltiples permisos.
   */
  @Post('rol/:rolId/modulo/:moduloId/asignar')
  async asignarPermisos(
    @Param('rolId') rolId: string,
    @Param('moduloId') moduloId: string,
    @Body() dto: AsignarPermisosRolModuloDto,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.asignarPermisos(
      rolId,
      moduloId,
      dto,
      idUsuario,
    );
  }

  /**
   * Endpoint 9
   * PUT /rol-modulo-permiso/rol/:rolId/modulo/:moduloId/reemplazar
   * Reemplazar todos los permisos de un módulo.
   */
  @Put('rol/:rolId/modulo/:moduloId/reemplazar')
  async reemplazarPermisos(
    @Param('rolId') rolId: string,
    @Param('moduloId') moduloId: string,
    @Body() dto: ReemplazarPermisosRolModuloDto,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.reemplazarPermisos(
      rolId,
      moduloId,
      dto,
      idUsuario,
    );
  }

  /**
   * Endpoint 4
   * GET /rol-modulo-permiso/rol/:rolId
   * Obtener asignaciones de un rol.
   */
  @Get('rol/:rolId')
  async buscarPorRol(
    @Param('rolId') rolId: string,
  ): Promise<RolModuloPermisoResponse[]> {
    return this.rolModuloPermisoService.buscarPorRol(rolId);
  }

  /**
   * Endpoint 5
   * GET /rol-modulo-permiso/rol/:rolId/modulo/:moduloId
   * Obtener permisos de un rol dentro de un módulo.
   */
  @Get('rol/:rolId/modulo/:moduloId')
  async buscarPorRolYModulo(
    @Param('rolId') rolId: string,
    @Param('moduloId') moduloId: string,
  ): Promise<RolModuloPermisoResponse[]> {
    return this.rolModuloPermisoService.buscarPorRolYModulo(rolId, moduloId);
  }

  /**
   * Endpoint 3
   * GET /rol-modulo-permiso/:id
   * Buscar asignación por ID.
   */
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
  ): Promise<RolModuloPermisoResponse> {
    return this.rolModuloPermisoService.buscarPorId(id);
  }

  /**
   * Endpoint 10
   * PATCH /rol-modulo-permiso/:id
   * Actualizar una asignación.
   */
  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateRolModuloPermisoDto,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.actualizar(id, dto, idUsuario);
  }

  /**
   * Endpoint 11
   * PATCH /rol-modulo-permiso/:id/estado
   * Cambiar estado de una asignación.
   */
  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.cambiarEstado(id, idUsuario);
  }
}
