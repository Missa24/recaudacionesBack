import { Module } from '@nestjs/common';
import { CorrelativoAnualService } from './correlativo_anual.service';
import { CorrelativoAnualController } from './correlativo_anual.controller';

@Module({
  controllers: [CorrelativoAnualController],
  providers: [CorrelativoAnualService],
})
export class CorrelativoAnualModule {}
