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
  UsuarioAccesos,
  UsuarioConRoles,
} from './interfaces/usuario-rol-response.interface';
import { AsignarRolesDto } from './dto/asignar-roles.dto';
import { ActualizarRolesDto } from './dto/actualizar-roles.dto';
import { QueryUsuarioRolDto } from './dto/query-usuario-rol.dto';
import { UsuarioRolService } from './usuario-rol.service';

/** UUID temporal del responsable, igual que en Usuario. Debe existir si la auditoría tiene FK. */
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Módulo: Seguridad / UsuarioRol
 * Archivo: usuario-rol.controller.ts
 * Descripción:
 *   Rutas y documentación Swagger. La envoltura success/status/data la agrega el interceptor global.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@ApiTags('Seguridad / Usuario Rol')
// Integración JWT: importar ApiBearerAuth, UseGuards y AuthGuard y habilitar:
// @ApiBearerAuth('JWT')
// @UseGuards(AuthGuard('jwt'))
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly servicio: UsuarioRolService) {}

  /*
  Nombre del método: asignarRoles
  Método HTTP relacionado: POST
  Endpoint: /api/usuario-rol

  Descripción:
    Asigna varios roles a un usuario, sin duplicar asignaciones.

  Parámetros:
    - dto: Usuario y roles a asignar.

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
    summary: 'Asignar roles',
    description: 'Asigna varios roles a un usuario, sin duplicar asignaciones.',
  })
  @ApiBody({
    type: AsignarRolesDto,
    examples: {
      ejemplo: {
        value: {
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
          idsRoles: ['550e8400-e29b-41d4-a716-446655440001'],
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
          message: 'Roles asignados correctamente.',
          ids: ['550e8400-e29b-41d4-a716-446655440002'],
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
  asignarRoles(@Body() dto: AsignarRolesDto): Promise<MensajeIdsResponse> {
    return this.servicio.asignarRoles(dto, userId);
  }

  /*
  Nombre del método: listarUsuariosConRoles
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol

  Descripción:
    Lista usuarios con sus roles y permite búsqueda, filtros y paginación.

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
    summary: 'Listar usuarios con roles',
    description:
      'Lista usuarios con sus roles y permite búsqueda, filtros y paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          items: [
            {
              idUsuario: '550e8400-e29b-41d4-a716-446655440000',
              username: 'oscar.henry',
              roles: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  nombre: 'Consulta',
                  idAsignacion: '550e8400-e29b-41d4-a716-446655440002',
                  estado: 'ACTIVO',
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
  listarUsuariosConRoles(
    @Query() query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioConRoles>> {
    return this.servicio.listarUsuariosConRoles(query);
  }

  /*
  Nombre del método: obtenerAccesosDeUsuario
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol/usuario/:valor/accesos

  Descripción:
    Consulta por ID, username o CI y devuelve roles, módulos y permisos activos.

  Parámetros:
    - valor: UUID, username o CI.

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
  @Get('usuario/:valor/accesos')
  @ApiOperation({
    summary: 'Obtener accesos de usuario',
    description:
      'Consulta por ID, username o CI y devuelve roles, módulos y permisos activos.',
  })
  @ApiParam({
    name: 'valor',
    type: String,
    description: 'UUID, username o CI del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
          username: 'oscar.henry',
          roles: [
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
                    },
                  ],
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
  obtenerAccesosDeUsuario(
    @Param('valor') valor: string,
  ): Promise<UsuarioAccesos> {
    return this.servicio.obtenerAccesosDeUsuario(valor);
  }

  /*
  Nombre del método: buscarUsuarioConRoles
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol/usuario/:valor

  Descripción:
    Consulta por ID, username o CI y muestra sus roles administrativos.

  Parámetros:
    - valor: Identificador.
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
  @Get('usuario/:valor')
  @ApiOperation({
    summary: 'Buscar usuario con roles',
    description:
      'Consulta por ID, username o CI y muestra sus roles administrativos.',
  })
  @ApiParam({
    name: 'valor',
    type: String,
    description: 'UUID, username o CI del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
          username: 'oscar.henry',
          roles: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              nombre: 'Consulta',
              idAsignacion: '550e8400-e29b-41d4-a716-446655440002',
              estado: 'ACTIVO',
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
  buscarUsuarioConRoles(
    @Param('valor') valor: string,
    @Query() query: QueryUsuarioRolDto,
  ): Promise<UsuarioConRoles> {
    return this.servicio.buscarUsuarioConRoles(valor, query);
  }

  /*
  Nombre del método: listarUsuariosPorRol
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol/rol/:idRol/usuarios

  Descripción:
    Lista con paginación los usuarios que tienen el rol seleccionado.

  Parámetros:
    - idRol: UUID del rol.
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
  @Get('rol/:idRol/usuarios')
  @ApiOperation({
    summary: 'Listar usuarios por rol',
    description:
      'Lista con paginación los usuarios que tienen el rol seleccionado.',
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
          items: [
            {
              idUsuario: '550e8400-e29b-41d4-a716-446655440000',
              username: 'oscar.henry',
              roles: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  nombre: 'Consulta',
                  idAsignacion: '550e8400-e29b-41d4-a716-446655440002',
                  estado: 'ACTIVO',
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
  listarUsuariosPorRol(
    @Param('idRol', ParseUUIDPipe) idRol: string,
    @Query() query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioConRoles>> {
    return this.servicio.listarUsuariosPorRol(idRol, query);
  }

  /*
  Nombre del método: actualizarRolesDeUsuario
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/usuario/:idUsuario/roles

  Descripción:
    Guarda la selección completa de roles del usuario, retirando los omitidos.

  Parámetros:
    - idUsuario: UUID.
    - dto: Roles finales; [] quita todos.

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
  @Patch('usuario/:idUsuario/roles')
  @ApiOperation({
    summary: 'Actualizar roles de usuario',
    description:
      'Guarda la selección completa de roles del usuario, retirando los omitidos.',
  })
  @ApiBody({
    type: ActualizarRolesDto,
    examples: {
      ejemplo: {
        value: { idsRoles: ['550e8400-e29b-41d4-a716-446655440001'] },
      },
    },
  })
  @ApiParam({
    name: 'idUsuario',
    type: String,
    description: 'UUID del registro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación realizada correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          message: 'Roles del usuario actualizados correctamente.',
          ids: ['550e8400-e29b-41d4-a716-446655440002'],
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
  actualizarRolesDeUsuario(
    @Param('idUsuario', ParseUUIDPipe) idUsuario: string,
    @Body() dto: ActualizarRolesDto,
  ): Promise<MensajeIdsResponse> {
    return this.servicio.actualizarRolesDeUsuario(idUsuario, dto, userId);
  }

  /*
  Nombre del método: cambiarEstado
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/:id/estado

  Descripción:
    Alterna alta/baja de la asignación sin recibir body.

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
    description: 'Alterna alta/baja de la asignación sin recibir body.',
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
          message: 'Rol del usuario dado de baja correctamente.',
          id: '550e8400-e29b-41d4-a716-446655440002',
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
