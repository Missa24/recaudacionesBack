import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UfvService } from './ufv.service';
import { CreateUfvDto } from './dto/create-ufv.dto';
import { UpdateUfvDto } from './dto/update-ufv.dto';

@Controller('ufv')
export class UfvController {
  constructor(private readonly ufvService: UfvService) {}

  @Post()
  create(@Body() createUfvDto: CreateUfvDto) {
    return this.ufvService.create(createUfvDto);
  }

  @Get()
  findAll() {
    return this.ufvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ufvService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUfvDto: UpdateUfvDto) {
    return this.ufvService.update(+id, updateUfvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ufvService.remove(+id);
  }
}
