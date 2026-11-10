/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv.controller.ts
 * Descripción:
 * Controlador encargado de exponer los endpoints para el registro,
 * consulta, actualización, sincronización y cambio de estado de los valores UFV.
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
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';

import { UfvService } from './ufv.service';
import { CreateUfvDto } from './dto/create-ufv.dto';
import { UpdateUfvDto } from './dto/update-ufv.dto';
import { UfvApiService } from './ufv-api.service';
import { QueryUfvDto } from './dto/query-ufv.dto';

// Identificador temporal del usuario responsable de las operaciones.
const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

/**
 * Controlador: UfvController
 * Descripción:
 * Gestiona las solicitudes HTTP relacionadas con los valores UFV
 * y delega su procesamiento a los servicios correspondientes.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@ApiTags('Catálogos / UFV')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('ufv')
export class UfvController {
  constructor(
    private readonly ufvService: UfvService,
    private readonly ufvApiService: UfvApiService,
  ) {}

  /*
  Nombre de la ruta: ufv
  Método HTTP: POST
  Descripción: Registra un nuevo valor UFV para una fecha determinada.
  Cuerpo de la solicitud (Body):
    - CreateUfvDto: Datos del valor UFV a registrar (fecha, valor, etc.).
  Respuestas posibles:
    - 201: UFV registrada correctamente.
    - 400: Datos de entrada inválidos.
    - 403: Acceso denegado.
    - 409: Ya existe una UFV para esa fecha.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: El identificador de usuario se toma de un valor temporal (userId) hasta integrar el usuario autenticado desde el JWT.
  */
  @Post()
  @ApiOperation({
    summary: 'Registrar UFV',
    description: 'Registra un nuevo valor de UFV para una fecha determinada.',
  })
  @ApiResponse({ status: 201, description: 'UFV registrada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una UFV para esa fecha.',
  })
  crear(@Body() dto: CreateUfvDto) {
    return this.ufvService.crear(dto, userId);
  }

  /*
  Nombre de la ruta: ufv/sincronizar
  Método HTTP: POST
  Descripción: Ejecuta la sincronización de valores UFV desde una fuente externa (API).
  Cuerpo de la solicitud (Body): No requiere body.
  Respuestas posibles:
    - 201: Sincronización ejecutada correctamente.
    - 403: Acceso denegado.
    - 500: Error durante la sincronización.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Delega la lógica a `UfvApiService.sincronizar()`. Se declara antes de `:id` para evitar conflicto con el parámetro genérico.
  */
  @Post('sincronizar')
  @ApiOperation({
    summary: 'Sincronizar UFV',
    description: 'Obtiene y sincroniza los valores UFV desde una API externa.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sincronización ejecutada correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 500, description: 'Error durante la sincronización.' })
  sincronizar() {
    return this.ufvApiService.sincronizar();
  }

  /*
  Nombre de la ruta: ufv
  Método HTTP: GET
  Descripción: Obtiene los registros UFV aplicando filtros, ordenamiento y paginación.
  Parámetros de consulta (Query):
    - QueryUfvDto: Filtros de búsqueda, orden y paginación.
  Respuestas posibles:
    - 200: Listado de registros UFV obtenido correctamente.
    - 403: Acceso denegado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Usa ApiOkResponse para documentar la respuesta exitosa. El decorador `@ApiOperation` está colocado encima de `@ApiOkResponse` y `@Get()`, orden que funciona igual.
  */
  @ApiOperation({
    summary: 'Listar registros UFV',
    description:
      'Permite buscar, filtrar, ordenar y paginar los registros UFV.',
  })
  @ApiOkResponse({
    description: 'Listado de registros UFV obtenido correctamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @Get()
  listar(@Query() query: QueryUfvDto) {
    return this.ufvService.listar(query);
  }

  /*
  Nombre de la ruta: ufv/:id
  Método HTTP: GET
  Descripción: Obtiene un registro UFV mediante su identificador único (UUID).
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Ruta declarada antes que `fecha/:fecha` en el código original; ver observaciones.
  */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener UFV por ID',
    description: 'Busca un registro de UFV mediante su identificador.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  obtenerPorId(@Param('id') id: string) {
    return this.ufvService.buscarPorId(id);
  }

  /*
  Nombre de la ruta: ufv/fecha/:fecha
  Método HTTP: GET
  Descripción: Obtiene un registro UFV correspondiente a una fecha específica.
  Parámetros de ruta (Param):
    - fecha: Fecha de consulta en formato AAAA-MM-DD.
  Respuestas posibles:
    - 200: Registro encontrado.
    - 403: Acceso denegado.
    - 404: No existe UFV para esa fecha.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: La ruta es literal (`fecha/:fecha`); ver observaciones sobre el orden respecto a `:id`.
  */
  @Get('fecha/:fecha')
  @ApiOperation({
    summary: 'Obtener UFV por fecha',
    description:
      'Busca un registro de UFV correspondiente a una fecha específica.',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha de consulta en formato AAAA-MM-DD.',
    example: '2026-11-07',
  })
  @ApiResponse({ status: 200, description: 'Registro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'No existe UFV para esa fecha.' })
  obtenerPorFecha(@Param('fecha') fecha: string) {
    return this.ufvService.buscarPorFecha(fecha);
  }

  /*
  Nombre de la ruta: ufv/:id
  Método HTTP: PATCH
  Descripción: Actualiza parcialmente los datos de un registro UFV existente.
  Parámetros de ruta (Param):
    - id: Identificador UUID del registro.
  Cuerpo de la solicitud (Body):
    - UpdateUfvDto: Campos a actualizar.
  Respuestas posibles:
    - 200: UFV actualizada correctamente.
    - 400: Datos de actualización inválidos.
    - 403: Acceso denegado.
    - 404: Registro no encontrado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Actualización parcial; solo se modifican los campos enviados en el body.
  */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar UFV',
    description: 'Modifica los datos de un registro UFV existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID del registro.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @ApiResponse({ status: 200, description: 'UFV actualizada correctamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateUfvDto) {
    return this.ufvService.actualizar(id, dto, userId);
  }

  /*
  Nombre de la ruta: ufv/:id/estado
  Método HTTP: PATCH
  Descripción: Cambia el estado de un registro UFV entre ACTIVO e INACTIVO.
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
    summary: 'Cambiar estado de UFV',
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
    return this.ufvService.cambiarEstado(id, userId);
  }
}
