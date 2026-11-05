import { Module } from '@nestjs/common';
import { UfvService } from './ufv.service';
import { UfvController } from './ufv.controller';

@Module({
  controllers: [UfvController],
  providers: [UfvService],
})
export class UfvModule {}
