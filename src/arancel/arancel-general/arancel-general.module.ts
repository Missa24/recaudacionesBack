import { Module } from '@nestjs/common';
import { ArancelGeneralService } from './arancel-general.service';
import { ArancelGeneralController } from './arancel-general.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelGeneral } from './entities/arancel-general.entity';
import { DependenciaModule } from 'src/catalogo/dependencia/dependencia.module';
import { CuentaBancariaModule } from 'src/catalogo/cuenta-bancaria/cuenta-bancaria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArancelGeneral]),
    DependenciaModule,
    CuentaBancariaModule,
  ],
  controllers: [ArancelGeneralController],
  providers: [ArancelGeneralService],
  exports: [ArancelGeneralService],
})
export class ArancelGeneralModule {}
