import { Module } from '@nestjs/common';
import { EntregaTramiteService } from './entrega-tramite.service';
import { EntregaTramiteController } from './entrega-tramite.controller';

@Module({
  controllers: [EntregaTramiteController],
  providers: [EntregaTramiteService],
})
export class EntregaTramiteModule {}
