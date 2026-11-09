import { Module } from '@nestjs/common';
import { UfvService } from './ufv.service';
import { UfvController } from './ufv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ufv } from './entities/ufv.entity';
import { UfvApiService } from './ufv-api.service';
import { HttpModule } from '@nestjs/axios';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ufv, Usuario]), HttpModule],
  controllers: [UfvController],
  providers: [UfvService, UfvApiService],
})
export class UfvModule {}
