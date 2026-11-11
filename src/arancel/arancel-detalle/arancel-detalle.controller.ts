import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArancelDetalleService } from './arancel-detalle.service';
import { CreateArancelDetalleDto } from './dto/create-arancel-detalle.dto';
import { UpdateArancelDetalleDto } from './dto/update-arancel-detalle.dto';

@Controller('arancel-detalle')
export class ArancelDetalleController {
  constructor(private readonly arancelDetalleService: ArancelDetalleService) {}

  @Post()
  create(@Body() createArancelDetalleDto: CreateArancelDetalleDto) {
    return this.arancelDetalleService.create(createArancelDetalleDto);
  }

  @Get()
  findAll() {
    return this.arancelDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arancelDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArancelDetalleDto: UpdateArancelDetalleDto) {
    return this.arancelDetalleService.update(+id, updateArancelDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arancelDetalleService.remove(+id);
  }
}
