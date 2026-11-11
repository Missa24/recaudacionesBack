import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArancelGeneralService } from './arancel-general.service';
import { CreateArancelGeneralDto } from './dto/create-arancel-general.dto';
import { UpdateArancelGeneralDto } from './dto/update-arancel-general.dto';

@Controller('arancel-general')
export class ArancelGeneralController {
  constructor(private readonly arancelGeneralService: ArancelGeneralService) {}

  @Post()
  create(@Body() createArancelGeneralDto: CreateArancelGeneralDto) {
    return this.arancelGeneralService.create(createArancelGeneralDto);
  }

  @Get()
  findAll() {
    return this.arancelGeneralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arancelGeneralService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArancelGeneralDto: UpdateArancelGeneralDto) {
    return this.arancelGeneralService.update(+id, updateArancelGeneralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arancelGeneralService.remove(+id);
  }
}
