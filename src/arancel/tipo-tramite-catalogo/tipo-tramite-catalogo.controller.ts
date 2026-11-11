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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TipoTramiteCatalogoService } from './tipo-tramite-catalogo.service';
import { CreateTipoTramiteCatalogoDto } from './dto/create-tipo-tramite-catalogo.dto';
import { QueryTipoTramiteCatalogoDto } from './dto/query-tipo-tramite-catalogo.dto';
import { UpdateTipoTramiteCatalogoDto } from './dto/update-tipo-tramite-catalogo.dto';
import {
  TipoTramiteCatalogoMessageResponse,
  TipoTramiteCatalogoResponse,
} from './interface/tipo-tramite-catalogo-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Arancel / Tipos de trámite')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('tipo-tramite-catalogo')
export class TipoTramiteCatalogoController {
  constructor(
    private readonly tipoTramiteCatalogoService: TipoTramiteCatalogoService,
  ) {}

  @Post()
  crear(
    @Body() dto: CreateTipoTramiteCatalogoDto,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    return this.tipoTramiteCatalogoService.crear(dto, userId);
  }

  @Get()
  listar(
    @Query() query: QueryTipoTramiteCatalogoDto,
  ): Promise<PaginatedResponse<TipoTramiteCatalogoResponse>> {
    return this.tipoTramiteCatalogoService.listar(query);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TipoTramiteCatalogoResponse> {
    return this.tipoTramiteCatalogoService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTipoTramiteCatalogoDto,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    return this.tipoTramiteCatalogoService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    return this.tipoTramiteCatalogoService.cambiarEstado(id, userId);
  }
}
