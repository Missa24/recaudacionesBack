import { Module } from '@nestjs/common';
import { RequisitoEntregadoService } from './requisito_entregado.service';
import { RequisitoEntregadoController } from './requisito_entregado.controller';

@Module({
  controllers: [RequisitoEntregadoController],
  providers: [RequisitoEntregadoService],
})
export class RequisitoEntregadoModule {}
