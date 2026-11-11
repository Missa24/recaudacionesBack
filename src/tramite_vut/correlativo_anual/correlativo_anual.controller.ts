import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorrelativoAnualService } from './correlativo_anual.service';
import { CreateCorrelativoAnualDto } from './dto/create-correlativo_anual.dto';
import { UpdateCorrelativoAnualDto } from './dto/update-correlativo_anual.dto';

@Controller('correlativo-anual')
export class CorrelativoAnualController {
  constructor(private readonly correlativoAnualService: CorrelativoAnualService) {}

  @Post()
  create(@Body() createCorrelativoAnualDto: CreateCorrelativoAnualDto) {
    return this.correlativoAnualService.create(createCorrelativoAnualDto);
  }

  @Get()
  findAll() {
    return this.correlativoAnualService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.correlativoAnualService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCorrelativoAnualDto: UpdateCorrelativoAnualDto) {
    return this.correlativoAnualService.update(+id, updateCorrelativoAnualDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.correlativoAnualService.remove(+id);
  }
}
