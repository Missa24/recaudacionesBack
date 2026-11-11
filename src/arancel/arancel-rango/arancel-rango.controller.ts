import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArancelRangoService } from './arancel-rango.service';
import { CreateArancelRangoDto } from './dto/create-arancel-rango.dto';
import { UpdateArancelRangoDto } from './dto/update-arancel-rango.dto';

@Controller('arancel-rango')
export class ArancelRangoController {
  constructor(private readonly arancelRangoService: ArancelRangoService) {}

  @Post()
  create(@Body() createArancelRangoDto: CreateArancelRangoDto) {
    return this.arancelRangoService.create(createArancelRangoDto);
  }

  @Get()
  findAll() {
    return this.arancelRangoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arancelRangoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArancelRangoDto: UpdateArancelRangoDto) {
    return this.arancelRangoService.update(+id, updateArancelRangoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arancelRangoService.remove(+id);
  }
}
