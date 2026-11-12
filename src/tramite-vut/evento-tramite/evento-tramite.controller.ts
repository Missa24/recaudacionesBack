import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventoTramiteService } from './evento-tramite.service';
import { CreateEventoTramiteDto } from './dto/create-evento-tramite.dto';
import { UpdateEventoTramiteDto } from './dto/update-evento-tramite.dto';

@Controller('evento-tramite')
export class EventoTramiteController {
  constructor(private readonly eventoTramiteService: EventoTramiteService) {}

  @Post()
  create(@Body() createEventoTramiteDto: CreateEventoTramiteDto) {
    return this.eventoTramiteService.create(createEventoTramiteDto);
  }

  @Get()
  findAll() {
    return this.eventoTramiteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoTramiteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventoTramiteDto: UpdateEventoTramiteDto,
  ) {
    return this.eventoTramiteService.update(+id, updateEventoTramiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoTramiteService.remove(+id);
  }
}
