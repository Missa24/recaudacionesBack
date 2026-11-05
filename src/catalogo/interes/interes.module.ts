import { Module } from '@nestjs/common';
import { InteresService } from './interes.service';
import { InteresController } from './interes.controller';

@Module({
  controllers: [InteresController],
  providers: [InteresService],
})
export class InteresModule {}
