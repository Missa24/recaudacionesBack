import { Module } from '@nestjs/common';
import { ArancelGeneralService } from './arancel-general.service';
import { ArancelGeneralController } from './arancel-general.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelGeneral } from './entities/arancel-general.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArancelGeneral])],
  controllers: [ArancelGeneralController],
  providers: [ArancelGeneralService],
})
export class ArancelGeneralModule {}
