import { Module } from '@nestjs/common';
import { ArancelDetalleService } from './arancel-detalle.service';
import { ArancelDetalleController } from './arancel-detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelDetalle } from './entities/arancel-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArancelDetalle])],
  controllers: [ArancelDetalleController],
  providers: [ArancelDetalleService],
})
export class ArancelDetalleModule {}
