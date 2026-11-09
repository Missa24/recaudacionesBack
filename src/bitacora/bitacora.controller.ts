import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { UpdateBitacoraDto } from './dto/update-bitacora.dto';
import { AuthGuard } from '@nestjs/passport'
import { QueryBitacoraDto } from './dto/query-bitacora.dto';
import { Bitacora } from './entities/bitacora.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('bitacora')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Bitácora')
@ApiBearerAuth('JWT')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un evento en la bitácora' })
  @ApiBody({ type: CreateBitacoraDto })
  @ApiResponse({ status: 201, description: 'Evento registrado correctamente', type: Bitacora })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  create(@Body() createBitacoraDto: CreateBitacoraDto) {
    return this.bitacoraService.create(createBitacoraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar eventos de bitácora con filtros y paginación' })
  @ApiQuery({ name: 'sistemaId', required: false, format: 'uuid', description: 'Filtrar por sistema' })
  @ApiQuery({ name: 'usuarioId', required: false, format: 'uuid', description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'tablaAfectada', required: false, description: 'Filtrar por tabla afectada' })
  @ApiQuery({ name: 'accion', required: false, description: 'Filtrar por acción', example: 'UPDATE' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'page', required: false, type: Number, minimum: 1, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, default: 20 })
  @ApiResponse({ status: 200, description: 'Eventos obtenidos correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@Query() query: QueryBitacoraDto) {
    return this.bitacoraService.findAll(query);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obtener la actividad reciente' })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, default: 10, example: 10 })
  @ApiResponse({ status: 200, description: 'Actividad reciente obtenida correctamente', type: [Bitacora] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getRecent(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.bitacoraService.getRecentActivity(limitNumber);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de la bitácora' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getStats() {
    return this.bitacoraService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento de bitácora por ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Evento obtenido correctamente', type: Bitacora })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Evento de bitácora no encontrado' })
  findOne(@Param('id') id: string) {
    return this.bitacoraService.findOne(id);
  }

  @Get('registro/:tabla/:registroId')
  @ApiOperation({ summary: 'Consultar el historial de un registro' })
  @ApiParam({ name: 'tabla', description: 'Nombre de la tabla afectada', example: 'usuarios' })
  @ApiParam({ name: 'registroId', format: 'uuid', description: 'ID del registro afectado' })
  @ApiResponse({ status: 200, description: 'Historial obtenido correctamente', type: [Bitacora] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findByRegistro(
    @Param('tabla') tabla: string,
    @Param('registroId') registroId: string,
  ) {
    return this.bitacoraService.findByRegistro(tabla, registroId);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Consultar eventos por usuario' })
  @ApiParam({ name: 'usuarioId', format: 'uuid', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Eventos obtenidos correctamente', type: [Bitacora] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.bitacoraService.findByUsuario(usuarioId);
  }

  @Get('sistema/:sistemaId')
  @ApiOperation({ summary: 'Consultar eventos por sistema' })
  @ApiParam({ name: 'sistemaId', format: 'uuid', description: 'ID del sistema' })
  @ApiResponse({ status: 200, description: 'Eventos obtenidos correctamente', type: [Bitacora] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findBySistema(@Param('sistemaId') sistemaId: string) {
    return this.bitacoraService.findBySistema(sistemaId);
  }

  @Get('accion/:accion')
  @ApiOperation({ summary: 'Consultar eventos por acción' })
  @ApiParam({ name: 'accion', description: 'Acción registrada', example: 'UPDATE' })
  @ApiResponse({ status: 200, description: 'Eventos obtenidos correctamente', type: [Bitacora] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findByAccion(@Param('accion') accion: string) {
    return this.bitacoraService.findByAccion(accion);
  }

  @Get('audit/:tabla/:registroId')
  @ApiOperation({ summary: 'Obtener la traza de auditoría de un registro' })
  @ApiParam({ name: 'tabla', description: 'Nombre de la tabla afectada', example: 'usuarios' })
  @ApiParam({ name: 'registroId', format: 'uuid', description: 'ID del registro afectado' })
  @ApiResponse({ status: 200, description: 'Traza de auditoría obtenida correctamente', type: [Bitacora] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getAuditTrail(
    @Param('tabla') tabla: string,
    @Param('registroId') registroId: string,
  ) {
    return this.bitacoraService.getAuditTrail(tabla, registroId);
  }
}
