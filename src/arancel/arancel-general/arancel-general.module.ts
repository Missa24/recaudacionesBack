import { Module } from '@nestjs/common';
import { ArancelGeneralService } from './arancel-general.service';
import { ArancelGeneralController } from './arancel-general.controller';

@Module({
  controllers: [ArancelGeneralController],
  providers: [ArancelGeneralService],
})
export class ArancelGeneralModule {}
