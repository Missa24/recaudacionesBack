import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DerivacionService } from './derivacion.service';
import { CreateDerivacionDto } from './dto/create-derivacion.dto';
import { UpdateDerivacionDto } from './dto/update-derivacion.dto';

@Controller('derivacion')
export class DerivacionController {
  constructor(private readonly derivacionService: DerivacionService) {}

  @Post()
  create(@Body() createDerivacionDto: CreateDerivacionDto) {
    return this.derivacionService.create(createDerivacionDto);
  }

  @Get()
  findAll() {
    return this.derivacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.derivacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDerivacionDto: UpdateDerivacionDto) {
    return this.derivacionService.update(+id, updateDerivacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.derivacionService.remove(+id);
  }
}
