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
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';
import { QueryUsuarioRolDto } from './dto/query-usuario-rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import {
  UsuarioRolMessageResponse,
  UsuarioRolResponse,
} from './interface/usuario-rol-response.interface';
import { UsuarioRolService } from './usuario-rol.service';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Seguridad / Usuario Rol')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) {}

  @Post()
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  @ApiResponse({ status: 201, description: 'Asignación registrada.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o referencia inactiva.',
  })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado.' })
  @ApiResponse({ status: 409, description: 'La asignación ya existe.' })
  crear(@Body() dto: CreateUsuarioRolDto): Promise<UsuarioRolMessageResponse> {
    return this.usuarioRolService.crear(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar asignaciones con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Listado paginado obtenido.' })
  listar(
    @Query() query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioRolResponse>> {
    return this.usuarioRolService.listar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiParam({ name: 'id', description: 'Identificador UUID de la asignación.' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioRolResponse> {
    return this.usuarioRolService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación de rol' })
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
    @Body() dto: UpdateUsuarioRolDto,
  ): Promise<UsuarioRolMessageResponse> {
    return this.usuarioRolService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado de una asignación' })
  @ApiParam({ name: 'id', description: 'Identificador UUID de la asignación.' })
  @ApiResponse({ status: 200, description: 'Estado cambiado.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioRolMessageResponse> {
    return this.usuarioRolService.cambiarEstado(id, userId);
  }
}
