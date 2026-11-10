/**
 * Módulo: Catálogo - Interés
 * Archivo: interes.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización, sincronización y cambio de estado de los valores de Interés.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { InteresService } from './interes.service';
import { CreateInteresDto } from './dto/create-interes.dto';
import { UpdateInteresDto } from './dto/update-interes.dto';
import { QueryInteresDto } from './dto/query-interes.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: InteresController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los valores de Interés
 * y delega su procesamiento a los servicios correspondientes.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / Intereses')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('interes')
export class InteresController {
  constructor(private readonly interesService: InteresService) {}

  /*
  Nombre de la ruta: interes
  Método HTTP: POST
  Descripción: Registra un nuevo valor de Interés para una fecha determinada.
  Cuerpo de la solicitud (Body):
    - CreateInteresDto: Datos del interés a registrar (fecha, valor, etc.).
  Respuestas posibles:
    - 201: Interés registrado correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 409: Ya existe un interés para esa fecha.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (userId) hasta integrar el usuario autenticado desde el JWT.
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar Interés',
    description: 'Registra un nuevo interés para una fecha.',
  })
  @ApiResponse({
    status: 201,
    description: 'Interés registrado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un interés para esa fecha.',
  })
  crear(@Body() dto: CreateInteresDto) {
    return this.interesService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: interes
  Método HTTP: GET
  Descripción: Obtiene los registros de Interés aplicando filtros, ordenamiento y paginación.
  Parámetros de consulta (Query):
    - QueryInteresDto: Filtros de búsqueda, orden y paginación.
  Respuestas posibles:
    - 200: Listado de registros de Interés obtenido correctamente.
    - 403: Acceso denegado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Usa ApiOkResponse para documentar la respuesta exitosa. No declara tipo de retorno explícito en la firma.
  */
  @ApiOperation({
    summary: 'Lista registro de Interés',
    description: 'Permite buscar, filtrar, ordenar y paginar los registros.',
  })
  @ApiOkResponse({
    description: 'Listado de registros de Interés obtenido correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @Get()
  listar(@Query() query: QueryInteresDto) {
    return this.interesService.listar(query);
  }

  /*
  Nombre de la ruta: interes/:id
  Método HTTP: GET
  Descripción: Obtiene un registro de Interés mediante su identificador único (UUID).
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Ruta declarada después de las rutas literales para evitar conflictos de matching.
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener Interés por Id',
    description: 'Busca un registro de interés mediante el identificador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  ObtenerPorId(@Param('id') id: string) {
    return this.interesService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: interes/fecha/:fecha
  Método HTTP: GET
  Descripción: Obtiene un registro de Interés correspondiente a una fecha específica.
  Parámetros de ruta (Param):
    - fecha: Fecha de consulta en formato AAAA-MM-DD.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: No existe un Interés para esa fecha.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: La ruta es literal (`fecha/:fecha`) y se resuelve sin conflictos con `:id` por su prefijo fijo.
  */
  @Get('fecha/:fecha')
  @ApiOperation({
    summary: 'Obtener un Interés por fecha',
    description:
      'Busca un registro de Interés correspondiente a una fecha específica.',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha de consulta en formato AAAA-MM-DD',
    example: '2026-11-09',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 404,
    description: 'No existe un Interés para esa fecha.',
  })
  obtenerPorFecha(@Param('fecha') fecha: string) {
    return this.interesService.buscarPorFecha(fecha);
  }

  /*
  Nombre de la ruta: interes/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente los datos de un registro de Interés existente.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Cuerpo de la solicitud (Body):
    - UpdateInteresDto: Campos a actualizar.
  Respuestas posibles:
    - 200: Interés actualizado correctamente.
    - 400: Datos de actualización inválidos.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Actualización parcial; solo se modifican los campos enviados en el body.
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar interés',
    description: 'Modifica los datos de un registro de Interés existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Interés actualizado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateInteresDto) {
    return this.interesService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: interes/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia el estado de un registro de Interés entre ACTIVO e INACTIVO.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: No recibe body; el nuevo estado se deriva del estado actual (alterna entre ACTIVO e INACTIVO).
  */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de Interés',
    description: 'Alterna el estado del registro entre ACTIVO e INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  cambiarEstado(@Param('id') id: string) {
    return this.interesService.cambiarEstado(id, userId);
  }
}
