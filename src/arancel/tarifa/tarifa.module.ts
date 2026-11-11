import { Module } from '@nestjs/common';
import { TarifaService } from './tarifa.service';
import { TarifaController } from './tarifa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarifa } from './entities/tarifa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarifa])],
  controllers: [TarifaController],
  providers: [TarifaService],
})
export class TarifaModule {}
