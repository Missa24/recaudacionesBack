import { Module } from '@nestjs/common';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { CuentaBancariaController } from './cuenta-bancaria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { Banco } from '../banco/entities/banco.entity';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { BancoModule } from '../banco/banco.module';
import { DependenciaModule } from '../dependencia/dependencia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaBancaria, Banco, Dependencia]),
    BancoModule,
    DependenciaModule,
  ],
  controllers: [CuentaBancariaController],
  providers: [CuentaBancariaService],
})
export class CuentaBancariaModule {}
