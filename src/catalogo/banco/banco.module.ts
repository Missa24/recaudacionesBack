import { Module } from '@nestjs/common';
import { BancoService } from './banco.service';
import { BancoController } from './banco.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banco } from './entities/banco.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banco, Usuario])],
  controllers: [BancoController],
  providers: [BancoService],
  exports: [BancoService]
})
export class BancoModule {}
