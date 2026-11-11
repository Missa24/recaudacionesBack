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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { CreateRolModuloPermisoDto } from './dto/create-rol-modulo-permiso.dto';
import { QueryRolModuloPermisoDto } from './dto/query-rol-modulo-permiso.dto';
import { UpdateRolModuloPermisoDto } from './dto/update-rol-modulo-permiso.dto';
import {
  RolModuloPermisoMessageResponse,
  RolModuloPermisoResponse,
} from './interface/rol-modulo-permiso-response.interface';
import { RolModuloPermisoService } from './rol-modulo-permiso.service';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Seguridad / Rol Módulo Permiso')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('rol-modulo-permiso')
export class RolModuloPermisoController {
  constructor(
    private readonly rolModuloPermisoService: RolModuloPermisoService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una asignación de rol, módulo y permiso',
  })
  @ApiResponse({ status: 201, description: 'Asignación registrada.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o referencia inactiva.',
  })
  @ApiResponse({ status: 404, description: 'Referencia no encontrada.' })
  @ApiResponse({ status: 409, description: 'La asignación ya existe.' })
  crear(
    @Body() dto: CreateRolModuloPermisoDto,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.crear(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar asignaciones con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Listado paginado obtenido.' })
  listar(
    @Query() query: QueryRolModuloPermisoDto,
  ): Promise<PaginatedResponse<RolModuloPermisoResponse>> {
    return this.rolModuloPermisoService.listar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiParam({ name: 'id', description: 'Identificador UUID de la asignación.' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RolModuloPermisoResponse> {
    return this.rolModuloPermisoService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación' })
  @ApiParam({ name: 'id', description: 'Identificador UUID de la asignación.' })
  @ApiResponse({ status: 200, description: 'Asignación actualizada.' })
  @ApiResponse({
    status: 400,
    description: 'Asignación inactiva o referencia inválida.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación o referencia no encontrada.',
  })
  @ApiResponse({ status: 409, description: 'La asignación ya existe.' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolModuloPermisoDto,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado de una asignación' })
  @ApiParam({ name: 'id', description: 'Identificador UUID de la asignación.' })
  @ApiResponse({ status: 200, description: 'Estado cambiado.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    return this.rolModuloPermisoService.cambiarEstado(id, userId);
  }
}
