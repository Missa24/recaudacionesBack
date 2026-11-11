import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoTramiteCatalogoService } from './tipo-tramite-catalogo.service';
import { CreateTipoTramiteCatalogoDto } from './dto/create-tipo-tramite-catalogo.dto';
import { UpdateTipoTramiteCatalogoDto } from './dto/update-tipo-tramite-catalogo.dto';

@Controller('tipo-tramite-catalogo')
export class TipoTramiteCatalogoController {
  constructor(private readonly tipoTramiteCatalogoService: TipoTramiteCatalogoService) {}

  @Post()
  create(@Body() createTipoTramiteCatalogoDto: CreateTipoTramiteCatalogoDto) {
    return this.tipoTramiteCatalogoService.create(createTipoTramiteCatalogoDto);
  }

  @Get()
  findAll() {
    return this.tipoTramiteCatalogoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoTramiteCatalogoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoTramiteCatalogoDto: UpdateTipoTramiteCatalogoDto) {
    return this.tipoTramiteCatalogoService.update(+id, updateTipoTramiteCatalogoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoTramiteCatalogoService.remove(+id);
  }
}
