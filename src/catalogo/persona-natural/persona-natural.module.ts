import { Module } from '@nestjs/common';
import { PersonaNaturalService } from './persona-natural.service';
import { PersonaNaturalController } from './persona-natural.controller';
import { PersonaNatural } from './entities/persona-natural.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonaNatural, Usuario])],
  controllers: [PersonaNaturalController],
  providers: [PersonaNaturalService],
  exports: [PersonaNaturalService],
})
export class PersonaNaturalModule {}
