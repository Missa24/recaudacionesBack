/**
 * Módulo: Seguridad - Sesión
 * Archivo: sesion.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el
 * registro, consulta, listado y cierre de sesiones de usuarios.
 *
 * Desarrollado por: Missael Apaza - Fecha: 12/11/2026
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
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';

import { SesionService } from './sesion.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { QuerySesionDto } from './dto/query-sesion.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: SesionController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con las sesiones
 * de acceso de los usuarios y delega su procesamiento al servicio.
 */
@ApiTags('Seguridad / Sesión')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('sesion')
export class SesionController {
  constructor(private readonly sesionService: SesionService) {}

  /*
  Nombre de la ruta: sesion
  Método HTTP: POST
  Descripción: Registra una nueva sesión para el usuario autenticado.
  Cuerpo de la solicitud (Body):
    - CreateSesionDto: Dirección IP y user agent del cliente.
  Respuestas posibles:
    - 201: Sesión registrada correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 500: No se pudo registrar la sesión.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar sesión',
    description:
      'Registra una nueva sesión de acceso para el usuario autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión registrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 500,
    description: 'No se pudo registrar la sesión.',
  })
  crear(@Body() dto: CreateSesionDto) {
    return this.sesionService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: sesion
  Método HTTP: GET
  Descripción: Obtiene todas las sesiones aplicando filtros,
               ordenamiento y paginación.
  Parámetros de consulta (Query):
    - QuerySesionDto: Filtros de búsqueda, orden y paginación.
  Respuestas posibles:
    - 200: Listado paginado de sesiones.
    - 400: Parámetros de consulta inválidos.
    - 403: Acceso denegado.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  @Get()
  @ApiOperation({
    summary: 'Listar sesiones',
    description:
      'Permite buscar, filtrar, ordenar y paginar las sesiones registradas.',
  })
  @ApiOkResponse({
    description: 'Listado de sesiones obtenido correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  listar(@Query() query: QuerySesionDto) {
    return this.sesionService.listar(query);
  }

  /*
  Nombre de la ruta: sesion/mis-sesiones
  Método HTTP: GET
  Descripción: Obtiene las sesiones correspondientes al usuario autenticado.
  Parámetros de consulta (Query):
    - QuerySesionDto: Filtros, ordenamiento y paginación.
  Respuestas posibles:
    - 200: Sesiones del usuario obtenidas correctamente.
    - 400: Parámetros inválidos.
    - 403: Acceso denegado.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  @Get('mis-sesiones')
  @ApiOperation({
    summary: 'Listar mis sesiones',
    description: 'Obtiene el historial de sesiones del usuario autenticado.',
  })
  @ApiOkResponse({
    description: 'Sesiones del usuario obtenidas correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  listarMisSesiones(@Query() query: QuerySesionDto) {
    return this.sesionService.listarPorUsuario(userId, query);
  }

  /*
  Nombre de la ruta: sesion/:id
  Método HTTP: GET
  Descripción: Obtiene una sesión mediante su identificador UUID.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la sesión.
  Respuestas posibles:
    - 200: Sesión encontrada.
    - 403: Acceso denegado.
    - 404: Sesión no encontrada.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener sesión por ID',
    description: 'Busca una sesión mediante su identificador único.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la sesión.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión encontrada.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Sesión no encontrada.',
  })
  obtenerPorId(@Param('id') id: string) {
    return this.sesionService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: sesion/:id/cerrar
  Método HTTP: PATCH
  Descripción: Finaliza una sesión activa del usuario autenticado.
  Parámetros de ruta (Param):
    - id: Identificador UUID de la sesión.
  Respuestas posibles:
    - 200: Sesión cerrada correctamente.
    - 403: Acceso denegado.
    - 404: Sesión no encontrada.
    - 409: La sesión ya se encuentra cerrada.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  @Patch(':id/cerrar')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Finaliza una sesión activa registrando su fecha de cierre.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID de la sesión.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Sesión no encontrada.',
  })
  @ApiResponse({
    status: 409,
    description: 'La sesión ya se encuentra cerrada.',
  })
  cerrar(@Param('id') id: string) {
    return this.sesionService.cerrar(id, userId);
  }
}
