import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { QueryApiTokenDto } from './dto/query-api-token.dto';
import { ApiToken } from './entities/api-token.entity';
import { BitacoraInterceptor } from '../bitacora/interceptors/bitacora.interceptor';
import { RegistrarBitacora } from '../bitacora/bitacora.decorator';

@ApiTags('API Tokens')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT')
@Controller('api-tokens')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(BitacoraInterceptor)
export class ApiTokensController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un API Token' })
  @ApiBody({ type: CreateApiTokenDto })
  @ApiResponse({ status: 201, description: 'API Token creado correctamente', type: ApiToken })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 409, description: 'El token ya existe' })
  @RegistrarBitacora({ tabla: 'api_tokens', accion: 'INSERT' })
  create(@Body() createDto: CreateApiTokenDto, @Request() req) {
    return this.apiTokensService.create(createDto, req.user?.username);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los API Tokens' })
  @ApiResponse({ status: 200, type: [ApiToken] })
  findAll() {
    return this.apiTokensService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar API Tokens por sistema o estado' })
  @ApiQuery({ name: 'sistemaId', required: false })
  @ApiQuery({ name: 'activo', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'search', required: false })
  search(@Query() query: QueryApiTokenDto) {
    return this.apiTokensService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un API Token por ID' })
  findOne(@Param('id') id: string) {
    return this.apiTokensService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un API Token' })
  @RegistrarBitacora({ tabla: 'api_tokens', accion: 'UPDATE' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateApiTokenDto,
    @Request() req,
  ) {
    return this.apiTokensService.update(id, updateDto, req.user?.username);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un API Token' })
  @RegistrarBitacora({ tabla: 'api_tokens', accion: 'DELETE' })
  remove(@Param('id') id: string, @Request() req) {
    return this.apiTokensService.remove(id, req.user?.username);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un API Token' })
  @RegistrarBitacora({ tabla: 'api_tokens', accion: 'RESTORE' })
  restore(@Param('id') id: string, @Request() req) {
    return this.apiTokensService.restore(id, req.user?.username);
  }
}