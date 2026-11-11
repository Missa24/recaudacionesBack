import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntregaTramiteService } from './entrega-tramite.service';
import { CreateEntregaTramiteDto } from './dto/create-entrega-tramite.dto';
import { UpdateEntregaTramiteDto } from './dto/update-entrega-tramite.dto';

@Controller('entrega-tramite')
export class EntregaTramiteController {
  constructor(private readonly entregaTramiteService: EntregaTramiteService) {}

  @Post()
  create(@Body() createEntregaTramiteDto: CreateEntregaTramiteDto) {
    return this.entregaTramiteService.create(createEntregaTramiteDto);
  }

  @Get()
  findAll() {
    return this.entregaTramiteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entregaTramiteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntregaTramiteDto: UpdateEntregaTramiteDto) {
    return this.entregaTramiteService.update(+id, updateEntregaTramiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entregaTramiteService.remove(+id);
  }
}
