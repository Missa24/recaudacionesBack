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

import {
  MensajeIdResponse,
  MensajeIdsResponse,
  RolConModulos,
} from '../asignaciones-common/interfaces/asignaciones-response.interface';

import { AsignarModulosPermisosDto } from './dto/asignar-modulos-permisos.dto';
import { ActualizarModulosPermisosDto } from './dto/actualizar-modulos-permisos.dto';
import { QueryRolModuloPermisoDto } from './dto/query-rol-modulo-permiso.dto';
import { RolModuloPermisoService } from './rol-modulo-permiso.service';
import { RolModuloPermisoListadoResponse } from './interfaces/rol-modulo-permiso-response.interface';

/** UUID temporal del responsable de las operaciones. */
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Módulo: Seguridad / Rol Módulo Permiso
 * Archivo: rol-modulo-permiso.controller.ts
 *
 * Descripción:
 *   Gestiona las asignaciones de módulos y permisos a los roles.
 *   El interceptor global agrega success, status y data.
 *
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@ApiTags('Seguridad / Rol Módulo Permiso')
// Integración JWT: importar y habilitar los decoradores correspondientes.
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('rol-modulo-permiso')
export class RolModuloPermisoController {
  constructor(private readonly servicio: RolModuloPermisoService) {}

  /*
  Nombre del método: asignarModulosPermisos
  Método HTTP relacionado: POST
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Asigna a un rol módulos con sus respectivos permisos,
    sin duplicar combinaciones.

  Parámetros:
    - dto: Rol, módulos y permisos a asignar.

  Respuestas posibles:
    - 201: Módulos y permisos asignados correctamente.
    - 400: Datos inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Rol, módulo o permiso no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Agrega accesos sin retirar los actuales.
    Registra al responsable y utiliza una transacción.
  */
  @Post()
  @ApiOperation({
    summary: 'Asignar módulos y permisos',
    description:
      'Asigna a un rol módulos con sus respectivos permisos, sin duplicados.',
  })
  @ApiBody({
    type: AsignarModulosPermisosDto,
    examples: {
      ejemplo: {
        value: {
          idRol: '550e8400-e29b-41d4-a716-446655440001',
          modulos: [
            {
              idModulo: '550e8400-e29b-41d4-a716-446655440002',
              idsPermisos: ['550e8400-e29b-41d4-a716-446655440003'],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Módulos y permisos asignados correctamente.',
    schema: {
      example: {
        success: true,
        status: 201,
        data: {
          message: 'Módulos y permisos asignados correctamente.',
          ids: ['550e8400-e29b-41d4-a716-446655440000'],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos o parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol, módulo o permiso no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto de asignación.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  asignarModulosPermisos(
    @Body() dto: AsignarModulosPermisosDto,
  ): Promise<MensajeIdsResponse> {
    return this.servicio.asignarModulosPermisos(dto, userId);
  }

  /*
  Nombre del método: listarRolesConModulosPermisos
  Método HTTP relacionado: GET
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Lista roles con sus módulos y permisos agrupados.
    Permite paginación, búsqueda y filtros.

  Parámetros:
    - query: Paginación y filtros de consulta.

  Respuestas posibles:
    - 200: Listado obtenido correctamente.
    - 400: Parámetros inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve datos resumidos, sin auditoría.
    Excluye asignaciones eliminadas lógicamente.
  */
  @Get()
  @ApiOperation({
    summary: 'Listar roles con módulos y permisos',
    description:
      'Lista roles con sus módulos y permisos agrupados, con paginación y filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado obtenido correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          items: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              nombre: 'Consulta',
              modulos: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440002',
                  nombres: 'Reporte de trámites',
                  permisos: [
                    {
                      id: '550e8400-e29b-41d4-a716-446655440003',
                      codigo: 'LEER',
                      idAsignacion: '550e8400-e29b-41d4-a716-446655440000',
                      estado: 'ACTIVO',
                    },
                  ],
                },
              ],
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
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  listarRolesConModulosPermisos(
    @Query() query: QueryRolModuloPermisoDto,
  ): Promise<PaginatedResponse<RolModuloPermisoListadoResponse>> {
    return this.servicio.listarRolesModulosPermisos(query);
  }

  /*
  Nombre del método: buscarRolConModulosPermisos
  Método HTTP relacionado: GET
  Endpoint: /api/rol-modulo-permiso/rol/:valor

  Descripción:
    Busca un rol por ID o código y devuelve
    sus módulos y permisos agrupados.

  Parámetros:
    - valor: UUID o código del rol.
    - query: Filtros de las asignaciones.

  Respuestas posibles:
    - 200: Rol y accesos obtenidos correctamente.
    - 400: Parámetros inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Rol no encontrado.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Permite consultar asignaciones activas e inactivas.
    Excluye asignaciones eliminadas lógicamente.
  */
  @Get('rol/:valor')
  @ApiOperation({
    summary: 'Buscar rol con módulos y permisos',
    description: 'Consulta por ID o código un rol con sus módulos y permisos.',
  })
  @ApiParam({
    name: 'valor',
    type: String,
    description: 'UUID o código del rol.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol y accesos obtenidos correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nombre: 'Consulta',
          modulos: [
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              nombres: 'Reporte de trámites',
              permisos: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440003',
                  codigo: 'LEER',
                  idAsignacion: '550e8400-e29b-41d4-a716-446655440000',
                  estado: 'ACTIVO',
                },
              ],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  buscarRolConModulosPermisos(
    @Param('valor') valor: string,
    @Query() query: QueryRolModuloPermisoDto,
  ): Promise<RolConModulos> {
    return this.servicio.buscarRolConModulosPermisos(valor, query);
  }

  /*
  Nombre del método: actualizarModulosPermisosDeRol
  Método HTTP relacionado: PATCH
  Endpoint: /api/rol-modulo-permiso/rol/:idRol/accesos

  Descripción:
    Guarda la configuración completa de módulos y permisos.
    Conserva o activa los incluidos y retira los omitidos.

  Parámetros:
    - idRol: UUID del rol.
    - dto: Selección final de módulos y permisos.

  Respuestas posibles:
    - 200: Módulos y permisos actualizados correctamente.
    - 400: Datos inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Rol, módulo o permiso no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    modulos: [] retira todos los accesos del rol.
    Registra al responsable y utiliza una transacción.
  */
  @Patch('rol/:idRol/accesos')
  @ApiOperation({
    summary: 'Actualizar módulos y permisos de un rol',
    description:
      'Guarda la configuración completa del rol, retirando los accesos omitidos.',
  })
  @ApiBody({
    type: ActualizarModulosPermisosDto,
    examples: {
      ejemplo: {
        value: {
          modulos: [
            {
              idModulo: '550e8400-e29b-41d4-a716-446655440002',
              idsPermisos: ['550e8400-e29b-41d4-a716-446655440003'],
            },
          ],
        },
      },
      quitarTodos: {
        value: {
          modulos: [],
        },
      },
    },
  })
  @ApiParam({
    name: 'idRol',
    type: String,
    description: 'UUID del rol.',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulos y permisos actualizados correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          message: 'Módulos y permisos del rol actualizados correctamente.',
          ids: ['550e8400-e29b-41d4-a716-446655440000'],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos o parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol, módulo o permiso no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto de asignación.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  actualizarModulosPermisosDeRol(
    @Param('idRol', ParseUUIDPipe) idRol: string,
    @Body() dto: ActualizarModulosPermisosDto,
  ): Promise<MensajeIdsResponse> {
    return this.servicio.actualizarModulosPermisosDeRol(idRol, dto, userId);
  }

  /*
  Nombre del método: cambiarEstado
  Método HTTP relacionado: PATCH
  Endpoint: /api/rol-modulo-permiso/:id/estado

  Descripción:
    Alterna el estado de una combinación
    entre ACTIVO e INACTIVO.

  Parámetros:
    - id: UUID de la asignación.

  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 400: UUID, estado o condiciones de alta inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Asignación o registro relacionado no encontrado.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    No recibe body.
    No elimina la asignación.
    Registra al responsable de la actualización.
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado',
    description: 'Alterna alta/baja de una combinación sin recibir body.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la asignación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          message: 'Asignación dada de baja correctamente.',
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'UUID, estado o condiciones de alta inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación o registro relacionado no encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MensajeIdResponse> {
    return this.servicio.cambiarEstado(id, userId);
  }
}
