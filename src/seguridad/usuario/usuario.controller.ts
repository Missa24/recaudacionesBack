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

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

import {
  UsuarioCreateResponse,
  UsuarioDetalleResponse,
  UsuarioEstadoResponse,
  UsuarioListadoResponse,
} from './interfaces/usuario-response.interface';

import { UsuarioService } from './usuario.service';

/**
 * UUID temporal del responsable de las operaciones.
 *
 * Posteriormente se reemplazará por el ID
 * del usuario autenticado mediante JWT.
 */
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Módulo: Seguridad / Usuario
 * Archivo: usuario.controller.ts
 *
 * Descripción:
 * Gestiona las solicitudes HTTP de Usuario
 * y delega la lógica al UsuarioService.
 *
 * Desarrollado por: Oscar Canchari
 */
@ApiTags('Seguridad / Usuarios')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /*
  Nombre de la ruta: Crear usuario
  Método HTTP: POST
  Endpoint: /api/usuario

  Descripción:
    Registra un usuario nuevo.
    Los datos son validados por CreateUsuarioDto.
    El Service comprueba los identificadores únicos.

  Parámetros:
    - dto: Datos para registrar el usuario.

  Respuestas:
    - 201: Usuario creado.
    - 400: Datos inválidos.
    - 401: No autorizado.
    - 409: Username, correo o CI duplicado.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  @Post()
  @ApiOperation({
    summary: 'Crear usuario',
    description:
      'Registra un usuario con estado ACTIVO, validando los datos y evitando identificadores duplicados.',
  })
  @ApiBody({
    type: CreateUsuarioDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente.',
    schema: {
      example: {
        success: true,
        status: 201,
        data: {
          message: 'Usuario creado correctamente.',
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados no son válidos.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'El username solo permite letras minúsculas y puntos entre palabras.',
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Username, correo o CI duplicado.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Ya existe un usuario con ese username.',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  crear(@Body() dto: CreateUsuarioDto): Promise<UsuarioCreateResponse> {
    return this.usuarioService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: Listar usuarios
  Método HTTP: GET
  Endpoint: /api/usuario

  Descripción:
    Obtiene usuarios mediante paginación.

    Permite:
    - Buscar por username, CI o email.
    - Filtrar por estado.
    - Filtrar por rango de fechas.
    - Ordenar por fecha de creación o actualización.
    - Seleccionar dirección ASC o DESC.

  Parámetros:
    - query: Filtros de QueryUsuarioDto.

  Respuestas:
    - 200: Listado obtenido correctamente.
    - 400: Filtros inválidos.
    - 401: No autorizado.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Lista usuarios con paginación, búsqueda por username, CI o correo, estado, fechas y ordenamiento.',
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
              nombres: 'Oscar Henry',
              apellido_paterno: 'Canchari',
              apellido_materno: 'Huayna',
              ci: '12345678',
              email: 'oscar.henry@gmail.com',
              estado: 'ACTIVO',
              responsable_creacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
              fecha_creacion: '2026-11-10T14:00:00.000Z',
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
    description: 'Los parámetros de consulta son inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  listar(
    @Query() query: QueryUsuarioDto,
  ): Promise<PaginatedResponse<UsuarioListadoResponse>> {
    return this.usuarioService.listar(query);
  }

  /*
    Nombre de la ruta: Buscar usuario
    Método HTTP: GET
    Endpoint: /api/usuario/buscar/:valor

    Descripción:
      Permite consultar un usuario mediante:
      - UUID.
      - Username.
      - Carnet de identidad.

      Devuelve los datos personales y de auditoría.

    Parámetros:
      - valor: Identificador del usuario.

    Respuestas posibles:
      - 200: Usuario encontrado.
      - 400: Identificador inválido.
      - 401: Token JWT inválido.
      - 404: Usuario no encontrado.
      - 500: Error interno del servidor.

    Desarrollado por: Oscar Canchari
    Fecha: 11/11/2026
  */

  @Get('buscar/:valor')
  @ApiOperation({
    summary: 'Buscar usuario por UUID, username o CI',
    description:
      'Busca un usuario por su identificador UUID, nombre de usuario o carnet de identidad.',
  })
  @ApiParam({
    name: 'valor',
    description: 'UUID, username o carnet de identidad del usuario.',
    type: String,
    example: 'oscar.henry',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
          username: 'oscar.henry',
          nombres: 'Oscar Henry',
          apellido_paterno: 'Canchari',
          apellido_materno: 'Huayna',
          ci: '12345678',
          email: 'oscar.henry@gmail.com',
          estado: 'ACTIVO',
          celular: '712345670',
          ultimo_acceso: null,
          responsable_creacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
          fecha_creacion: '2026-11-11T04:00:00.000Z',
          responsable_actualizacion: null,
          fecha_actualizacion: '2026-11-11T04:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Identificador inválido.',
    schema: {
      example: {
        statusCode: 400,
        message: 'El identificador debe ser un UUID, username o CI válido.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido o no proporcionado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message:
          'No se encontró ningún usuario con el identificador proporcionado.',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  buscarPorIdentificador(
    @Param('valor') valor: string,
  ): Promise<UsuarioDetalleResponse> {
    return this.usuarioService.buscarPorIdentificador(valor);
  }

  /*
  Nombre de la ruta: Editar usuario
  Método HTTP: PATCH
  Endpoint: /api/usuario/:id

  Descripción:
    Modifica parcialmente los datos personales.

    No permite actualizar el estado desde el body.
    Se utiliza UpdateUsuarioDto para validar
    solamente los campos enviados.

  Parámetros:
    - id: UUID del usuario.
    - dto: Datos que se desean actualizar.

  Respuestas:
    - 200: Usuario actualizado.
    - 400: Datos inválidos.
    - 401: No autorizado.
    - 404: Usuario no encontrado.
    - 409: Datos duplicados.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  @Patch(':id')
  @ApiOperation({
    summary: 'Editar usuario',
    description:
      'Actualiza parcialmente username, correo, CI, nombres, apellidos o celular. No modifica el estado.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario que será editado.',
    type: String,
  })
  @ApiBody({
    type: UpdateUsuarioDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
          username: 'oscar.henry',
          nombres: 'Oscar Henry',
          apellido_paterno: 'Canchari',
          apellido_materno: 'Huayna',
          ci: '12345678',
          email: 'oscar.henry@gmail.com',
          estado: 'ACTIVO',
          celular: '71234567',
          ultimo_acceso: null,
          responsable_creacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
          fecha_creacion: '2026-11-10T14:00:00.000Z',
          responsable_actualizacion: '8b461287-8416-412e-84e7-b5c77615ea2a',
          fecha_actualizacion: '2026-11-11T04:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados son inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Username, correo o CI duplicado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  editar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<UsuarioDetalleResponse> {
    return this.usuarioService.editar(id, dto, userId);
  }

  /*
  Nombre de la ruta: Alta o baja de usuario
  Método HTTP: PATCH
  Endpoint: /api/usuario/:id/estado

  Descripción:
    Cambia automáticamente el estado.

    ACTIVO -> INACTIVO.
    INACTIVO -> ACTIVO.

    No se recibe body.

  Parámetros:
    - id: UUID del usuario.

  Respuestas:
    - 200: Estado actualizado.
    - 400: Estado inválido.
    - 401: No autorizado.
    - 404: Usuario no encontrado.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Dar de alta o baja a un usuario',
    description:
      'Cambia automáticamente el estado entre ACTIVO e INACTIVO, sin recibir un body.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          message: 'Usuario dado de baja correctamente.',
          idUsuario: '550e8400-e29b-41d4-a716-446655440000',
          estado: 'INACTIVO',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'El estado actual no es válido.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioEstadoResponse> {
    return this.usuarioService.cambiarEstado(id, userId);
  }
}
