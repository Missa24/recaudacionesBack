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
import { ArancelGeneralService } from './arancel-general.service';
import { CreateArancelGeneralDto } from './dto/create-arancel-general.dto';
import { QueryArancelGeneralDto } from './dto/query-arancel-general.dto';
import { UpdateArancelGeneralDto } from './dto/update-arancel-general.dto';
import {
  ArancelGeneralMessageResponse,
  ArancelGeneralResponse,
} from './interface/arancel-general-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Arancel / Generales')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('arancel-general')
export class ArancelGeneralController {
  constructor(private readonly arancelGeneralService: ArancelGeneralService) {}

  @Post()
  crear(
    @Body() dto: CreateArancelGeneralDto,
  ): Promise<ArancelGeneralMessageResponse> {
    return this.arancelGeneralService.crear(dto, userId);
  }

  @Get()
  listar(
    @Query() query: QueryArancelGeneralDto,
  ): Promise<PaginatedResponse<ArancelGeneralResponse>> {
    return this.arancelGeneralService.listar(query);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArancelGeneralResponse> {
    return this.arancelGeneralService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArancelGeneralDto,
  ): Promise<ArancelGeneralMessageResponse> {
    return this.arancelGeneralService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArancelGeneralMessageResponse> {
    return this.arancelGeneralService.cambiarEstado(id, userId);
  }
}
