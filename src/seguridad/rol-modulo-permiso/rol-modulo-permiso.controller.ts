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
import {
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
  RolModuloPermisoListadoResponse,
} from './interfaces/rol-modulo-permiso-response.interface';
import { AsignarModulosPermisosDto } from './dto/asignar-modulos-permisos.dto';
import { ActualizarModulosPermisosDto } from './dto/actualizar-modulos-permisos.dto';
import { QueryRolModuloPermisoDto } from './dto/query-rol-modulo-permiso.dto';
import { RolModuloPermisoService } from './rol-modulo-permiso.service';

/** UUID temporal del responsable, igual que en Usuario. Debe existir si la auditoría tiene FK. */
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Módulo: Seguridad / RolModuloPermiso
 * Archivo: rol-modulo-permiso.controller.ts
 * Descripción:
 *   Rutas y documentación Swagger. La envoltura success/status/data la agrega el interceptor global.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@ApiTags('Seguridad / Rol Módulo Permiso')
// Integración JWT: importar ApiBearerAuth, UseGuards y AuthGuard y habilitar:
// @ApiBearerAuth('JWT')
// @UseGuards(AuthGuard('jwt'))
@Controller('rol-modulo-permiso')
export class RolModuloPermisoController {
  constructor(private readonly servicio: RolModuloPermisoService) {}

  /*
  Nombre del método: asignarModulosPermisos
  Método HTTP relacionado: POST
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Asigna a un rol módulos con sus respectivos permisos, sin duplicados.

  Parámetros:
    - dto: Rol, módulos y permisos.

  Respuestas posibles:
    - 201: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  @Post()
  @ApiOperation({
    summary: 'Asignar modulos permisos',
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
    description: 'Operación realizada correctamente.',
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
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro relacionado no encontrado.',
  })
  @ApiResponse({ status: 409, description: 'Conflicto de asignación.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
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
    Lista asignaciones con su PK, rol, módulo y permiso, con paginación y filtros.

  Parámetros:
    - query: Paginación y filtros.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  @Get()
  @ApiOperation({
    summary: 'Listar roles con modulos permisos',
    description:
      'Lista asignaciones con su PK, rol, módulo y permiso, con paginación y filtros.',
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
              id: '60000000-0000-4000-8000-000000000034',
              rol: {
                id: '20000000-0000-4000-8000-000000000004',
                nombre: 'Supervisor',
              },
              modulo: {
                id: '30000000-0000-4000-8000-000000000004',
                nombres: 'Registro de muebles',
              },
              permiso: {
                id: '40000000-0000-4000-8000-000000000003',
                codigo: 'MODIFICAR',
              },
              estado: 'ACTIVO',
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
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro relacionado no encontrado.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
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
    Consulta por ID o código un rol con sus módulos y permisos.

  Parámetros:
    - valor: UUID o código.
    - query: Filtros de asignación.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  @Get('rol/:valor')
  @ApiOperation({
    summary: 'Buscar rol con modulos permisos',
    description: 'Consulta por ID o código un rol con sus módulos y permisos.',
  })
  @ApiParam({
    name: 'valor',
    type: String,
    description: 'UUID o código del rol.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
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
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro relacionado no encontrado.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
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
    Guarda la configuración completa del rol, retirando los accesos omitidos.

  Parámetros:
    - idRol: UUID.
    - dto: Módulos y permisos finales; [] quita todos.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  @Patch('rol/:idRol/accesos')
  @ApiOperation({
    summary: 'Actualizar modulos permisos de rol',
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
    },
  })
  @ApiParam({ name: 'idRol', type: String, description: 'UUID del registro.' })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
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
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro relacionado no encontrado.',
  })
  @ApiResponse({ status: 409, description: 'Conflicto de asignación.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
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
    Alterna alta/baja de una combinación sin recibir body.

  Parámetros:
    - id: UUID de la asignación.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado',
    description: 'Alterna alta/baja de una combinación sin recibir body.',
  })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la asignación.' })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
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
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro relacionado no encontrado.',
  })
  @ApiResponse({ status: 409, description: 'Conflicto de asignación.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MensajeIdResponse> {
    return this.servicio.cambiarEstado(id, userId);
  }
}
