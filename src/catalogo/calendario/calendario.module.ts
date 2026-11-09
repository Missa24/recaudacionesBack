import { Module } from '@nestjs/common';
import { CalendarioService } from './calendario.service';
import { CalendarioController } from './calendario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendario } from './entities/calendario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendario])],
  controllers: [CalendarioController],
  providers: [CalendarioService],
})
export class CalendarioModule {}
