import { Module } from '@nestjs/common';
import { EventoTramiteService } from './evento-tramite.service';
import { EventoTramiteController } from './evento-tramite.controller';

@Module({
  controllers: [EventoTramiteController],
  providers: [EventoTramiteService],
})
export class EventoTramiteModule {}
