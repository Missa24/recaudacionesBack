import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InteresService } from './interes.service';
import { CreateIntereDto } from './dto/create-intere.dto';
import { UpdateIntereDto } from './dto/update-intere.dto';

@Controller('interes')
@ApiTags('Catálogos / Intereses')
export class InteresController {
  constructor(private readonly interesService: InteresService) {}

  @Post()
  create(@Body() createIntereDto: CreateIntereDto) {
    return this.interesService.create(createIntereDto);
  }

  @Get()
  findAll() {
    return this.interesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIntereDto: UpdateIntereDto) {
    return this.interesService.update(+id, updateIntereDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interesService.remove(+id);
  }
}
