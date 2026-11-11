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
  UsuarioAccesos,
  UsuarioConRoles,
} from '../asignaciones-common/interfaces/asignaciones-response.interface';

import { AsignarRolesDto } from './dto/asignar-roles.dto';
import { ActualizarRolesDto } from './dto/actualizar-roles.dto';
import { QueryUsuarioRolDto } from './dto/query-usuario-rol.dto';
import { UsuarioRolService } from './usuario-rol.service';

/** UUID temporal del responsable de las operaciones. */
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Módulo: Seguridad / Usuario Rol
 * Archivo: usuario-rol.controller.ts
 *
 * Descripción:
 *   Gestiona las asignaciones de roles y las consultas
 *   de accesos de los usuarios.
 *
 *   El interceptor global agrega success, status y data.
 *
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@ApiTags('Seguridad / Usuario Rol')
// Integración JWT: importar y habilitar los decoradores correspondientes.
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly servicio: UsuarioRolService) {}

  /*
  Nombre del método: asignarRoles
  Método HTTP relacionado: POST
  Endpoint: /api/usuario-rol

  Descripción:
    Asigna varios roles a un usuario sin duplicar asignaciones.

  Parámetros:
    - dto: Usuario y roles a asignar.

  Respuestas posibles:
    - 201: Roles asignados correctamente.
    - 400: Datos inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Usuario o rol no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Agrega roles sin retirar los actuales.
    Registra al responsable de la operación.
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
    description: 'Roles asignados correctamente.',
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
    description: 'Usuario o rol no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto de asignación.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  asignarRoles(@Body() dto: AsignarRolesDto): Promise<MensajeIdsResponse> {
    return this.servicio.asignarRoles(dto, userId);
  }

  /*
  Nombre del método: listarUsuariosConRoles
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol

  Descripción:
    Lista usuarios con sus roles.
    Permite búsqueda, filtros y paginación.

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
    Devuelve datos resumidos del usuario y sus roles.
    Excluye las asignaciones eliminadas lógicamente.
  */
  @Get()
  @ApiOperation({
    summary: 'Listar usuarios con roles',
    description:
      'Lista usuarios con sus roles, búsqueda, filtros y paginación.',
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
    Busca un usuario por ID, username o CI y devuelve
    sus roles, módulos y permisos efectivos.

  Parámetros:
    - valor: UUID, username o CI del usuario.

  Respuestas posibles:
    - 200: Accesos obtenidos correctamente.
    - 400: Identificador inválido.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Usuario no encontrado.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Solo incluye accesos activos y no eliminados.
    Devuelve una estructura agrupada sin auditoría.
  */
  @Get('usuario/:valor/accesos')
  @ApiOperation({
    summary: 'Obtener accesos de usuario',
    description:
      'Consulta por ID, username o CI los roles, módulos y permisos activos.',
  })
  @ApiParam({
    name: 'valor',
    type: String,
    description: 'UUID, username o CI del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Accesos obtenidos correctamente.',
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
  @ApiResponse({
    status: 400,
    description: 'Identificador inválido.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
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
    Busca un usuario por ID, username o CI
    y muestra sus roles administrativos.

  Parámetros:
    - valor: UUID, username o CI.
    - query: Filtros de las asignaciones.

  Respuestas posibles:
    - 200: Usuario y roles obtenidos correctamente.
    - 400: Parámetros inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Usuario no encontrado.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Permite consultar asignaciones activas e inactivas.
    Excluye asignaciones eliminadas lógicamente.
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
    description: 'Usuario y roles obtenidos correctamente.',
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
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
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
    Lista con paginación los usuarios
    que tienen el rol seleccionado.

  Parámetros:
    - idRol: UUID del rol.
    - query: Paginación y filtros.

  Respuestas posibles:
    - 200: Listado obtenido correctamente.
    - 400: Parámetros inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Rol no encontrado.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    El estado filtra las asignaciones usuario-rol.
    Excluye asignaciones eliminadas lógicamente.
  */
  @Get('rol/:idRol/usuarios')
  @ApiOperation({
    summary: 'Listar usuarios por rol',
    description:
      'Lista con paginación los usuarios que tienen el rol seleccionado.',
  })
  @ApiParam({
    name: 'idRol',
    type: String,
    description: 'UUID del rol.',
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
    Guarda la selección completa de roles del usuario.
    Conserva o activa los incluidos y retira los omitidos.

  Parámetros:
    - idUsuario: UUID del usuario.
    - dto: Selección final de roles.

  Respuestas posibles:
    - 200: Roles actualizados correctamente.
    - 400: Datos inválidos.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Usuario o rol no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Una lista vacía retira todos los roles.
    Registra al responsable y utiliza una transacción.
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
        value: {
          idsRoles: ['550e8400-e29b-41d4-a716-446655440001'],
        },
      },
      quitarTodos: {
        value: {
          idsRoles: [],
        },
      },
    },
  })
  @ApiParam({
    name: 'idUsuario',
    type: String,
    description: 'UUID del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles actualizados correctamente.',
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
    description: 'Usuario o rol no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto de asignación.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  actualizarRolesDeUsuario(
    @Param('idUsuario', ParseUUIDPipe) idUsuario: string,
    @Body() dto: ActualizarRolesDto,
  ): Promise<MensajeIdsResponse> {
    return this.servicio.actualizarRolesDeUsuario(idUsuario, dto, userId);
  }

  /*
  Nombre del método: quitarRol
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/:id/quitar

  Descripción:
    Retira una asignación de rol mediante eliminación lógica.

  Parámetros:
    - id: UUID de la asignación usuario-rol.

  Respuestas posibles:
    - 200: Rol retirado correctamente.
    - 400: UUID inválido.
    - 401: No autorizado, cuando se habilita JWT.
    - 404: Asignación no encontrada.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    No recibe body.
    Conserva el registro y registra al responsable del retiro.
  */
  @Patch(':id/quitar')
  @ApiOperation({
    summary: 'Quitar rol',
    description:
      'Retira una asignación mediante eliminación lógica, sin recibir body.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la asignación usuario-rol.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol retirado correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          message: 'Rol retirado del usuario correctamente.',
          id: '550e8400-e29b-41d4-a716-446655440002',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado; aplica al habilitar JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  quitarRol(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MensajeIdResponse> {
    return this.servicio.quitarRol(id, userId);
  }

  /*
  Nombre del método: cambiarEstado
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/:id/estado

  Descripción:
    Alterna el estado de la asignación entre ACTIVO e INACTIVO.

  Parámetros:
    - id: UUID de la asignación usuario-rol.

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
    description: 'Alterna alta/baja de la asignación sin recibir body.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la asignación usuario-rol.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
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
