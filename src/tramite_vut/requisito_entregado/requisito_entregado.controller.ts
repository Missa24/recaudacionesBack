import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitoEntregadoService } from './requisito_entregado.service';
import { CreateRequisitoEntregadoDto } from './dto/create-requisito_entregado.dto';
import { UpdateRequisitoEntregadoDto } from './dto/update-requisito_entregado.dto';

@Controller('requisito-entregado')
export class RequisitoEntregadoController {
  constructor(private readonly requisitoEntregadoService: RequisitoEntregadoService) {}

  @Post()
  create(@Body() createRequisitoEntregadoDto: CreateRequisitoEntregadoDto) {
    return this.requisitoEntregadoService.create(createRequisitoEntregadoDto);
  }

  @Get()
  findAll() {
    return this.requisitoEntregadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitoEntregadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisitoEntregadoDto: UpdateRequisitoEntregadoDto) {
    return this.requisitoEntregadoService.update(+id, updateRequisitoEntregadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitoEntregadoService.remove(+id);
  }
}
