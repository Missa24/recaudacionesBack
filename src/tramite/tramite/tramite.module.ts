import { Module } from '@nestjs/common';
import { TramiteService } from './tramite.service';
import { TramiteController } from './tramite.controller';

@Module({
  controllers: [TramiteController],
  providers: [TramiteService],
})
export class TramiteModule {}
