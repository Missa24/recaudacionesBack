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
import { ArancelDetalleService } from './arancel-detalle.service';
import { CreateArancelDetalleDto } from './dto/create-arancel-detalle.dto';
import { QueryArancelDetalleDto } from './dto/query-arancel-detalle.dto';
import { UpdateArancelDetalleDto } from './dto/update-arancel-detalle.dto';
import {
  ArancelDetalleMessageResponse,
  ArancelDetalleResponse,
} from './interface/arancel-detalle-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Arancel / Detalles')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('arancel-detalle')
export class ArancelDetalleController {
  constructor(private readonly arancelDetalleService: ArancelDetalleService) {}

  @Post()
  crear(
    @Body() dto: CreateArancelDetalleDto,
  ): Promise<ArancelDetalleMessageResponse> {
    return this.arancelDetalleService.crear(dto, userId);
  }

  @Get()
  listar(
    @Query() query: QueryArancelDetalleDto,
  ): Promise<PaginatedResponse<ArancelDetalleResponse>> {
    return this.arancelDetalleService.listar(query);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArancelDetalleResponse> {
    return this.arancelDetalleService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArancelDetalleDto,
  ): Promise<ArancelDetalleMessageResponse> {
    return this.arancelDetalleService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArancelDetalleMessageResponse> {
    return this.arancelDetalleService.cambiarEstado(id, userId);
  }
}
