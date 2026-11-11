import { Module } from '@nestjs/common';
import { RequisitoEntregadoService } from './requisito-entregado.service';
import { RequisitoEntregadoController } from './requisito-entregado.controller';

@Module({
  controllers: [RequisitoEntregadoController],
  providers: [RequisitoEntregadoService],
})
export class RequisitoEntregadoModule {}
