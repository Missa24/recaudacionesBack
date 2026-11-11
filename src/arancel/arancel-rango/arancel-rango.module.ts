import { Module } from '@nestjs/common';
import { ArancelRangoService } from './arancel-rango.service';
import { ArancelRangoController } from './arancel-rango.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelRango } from './entities/arancel-rango.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArancelRango])],
  controllers: [ArancelRangoController],
  providers: [ArancelRangoService],
})
export class ArancelRangoModule {}
