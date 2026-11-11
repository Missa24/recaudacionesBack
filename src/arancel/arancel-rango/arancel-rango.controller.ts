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
import { ArancelRangoService } from './arancel-rango.service';
import { CreateArancelRangoDto } from './dto/create-arancel-rango.dto';
import { QueryArancelRangoDto } from './dto/query-arancel-rango.dto';
import { UpdateArancelRangoDto } from './dto/update-arancel-rango.dto';
import {
  ArancelRangoMessageResponse,
  ArancelRangoResponse,
} from './interface/arancel-rango-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Arancel / Rangos')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('arancel-rango')
export class ArancelRangoController {
  constructor(private readonly arancelRangoService: ArancelRangoService) {}

  @Post()
  crear(
    @Body() dto: CreateArancelRangoDto,
  ): Promise<ArancelRangoMessageResponse> {
    return this.arancelRangoService.crear(dto, userId);
  }

  @Get()
  listar(
    @Query() query: QueryArancelRangoDto,
  ): Promise<PaginatedResponse<ArancelRangoResponse>> {
    return this.arancelRangoService.listar(query);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArancelRangoResponse> {
    return this.arancelRangoService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArancelRangoDto,
  ): Promise<ArancelRangoMessageResponse> {
    return this.arancelRangoService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArancelRangoMessageResponse> {
    return this.arancelRangoService.cambiarEstado(id, userId);
  }
}
