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
import { RequisitoService } from './requisito.service';
import { CreateRequisitoDto } from './dto/create-requisito.dto';
import { QueryRequisitoDto } from './dto/query-requisito.dto';
import { UpdateRequisitoDto } from './dto/update-requisito.dto';
import {
  RequisitoMessageResponse,
  RequisitoResponse,
} from './interface/requisito-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

@ApiTags('Arancel / Requisitos')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('arancel-requisito')
export class RequisitoController {
  constructor(private readonly requisitoService: RequisitoService) {}

  @Post()
  crear(@Body() dto: CreateRequisitoDto): Promise<RequisitoMessageResponse> {
    return this.requisitoService.crear(dto, userId);
  }

  @Get()
  listar(
    @Query() query: QueryRequisitoDto,
  ): Promise<PaginatedResponse<RequisitoResponse>> {
    return this.requisitoService.listar(query);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RequisitoResponse> {
    return this.requisitoService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequisitoDto,
  ): Promise<RequisitoMessageResponse> {
    return this.requisitoService.actualizar(id, dto, userId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RequisitoMessageResponse> {
    return this.requisitoService.cambiarEstado(id, userId);
  }
}
