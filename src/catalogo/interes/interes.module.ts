import { Module } from '@nestjs/common';
import { InteresService } from './interes.service';
import { InteresController } from './interes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interes } from './entities/interes.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Interes, Usuario])],
  controllers: [InteresController],
  providers: [InteresService],
})
export class InteresModule {}
