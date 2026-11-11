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
import { TarifaService } from './tarifa.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { QueryTarifaDto } from './dto/query-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import {
  TarifaMessageResponse,
  TarifaResponse,
} from './interface/tarifa-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Arancel / Tarifas')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('tarifa')
export class TarifaController {
  constructor(private readonly tarifaService: TarifaService) {}

  @Post()
  crear(@Body() dto: CreateTarifaDto): Promise<TarifaMessageResponse> {
    return this.tarifaService.crear(dto, userId);
  }

  @Get()
  listar(
    @Query() query: QueryTarifaDto,
  ): Promise<PaginatedResponse<TarifaResponse>> {
    return this.tarifaService.listar(query);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseUUIDPipe) id: string): Promise<TarifaResponse> {
    return this.tarifaService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTarifaDto,
  ): Promise<TarifaMessageResponse> {
    return this.tarifaService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TarifaMessageResponse> {
    return this.tarifaService.cambiarEstado(id, userId);
  }
}
