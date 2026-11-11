import { Module } from '@nestjs/common';
import { CorrelativoAnualService } from './correlativo-anual.service';
import { CorrelativoAnualController } from './correlativo-anual.controller';

@Module({
  controllers: [CorrelativoAnualController],
  providers: [CorrelativoAnualService],
})
export class CorrelativoAnualModule {}
