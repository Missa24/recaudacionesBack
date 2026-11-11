import { Injectable } from '@nestjs/common';
import { CreateRequisitoEntregadoDto } from './dto/create-requisito_entregado.dto';
import { UpdateRequisitoEntregadoDto } from './dto/update-requisito_entregado.dto';

@Injectable()
export class RequisitoEntregadoService {
  create(createRequisitoEntregadoDto: CreateRequisitoEntregadoDto) {
    return 'This action adds a new requisitoEntregado';
  }

  findAll() {
    return `This action returns all requisitoEntregado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requisitoEntregado`;
  }

  update(id: number, updateRequisitoEntregadoDto: UpdateRequisitoEntregadoDto) {
    return `This action updates a #${id} requisitoEntregado`;
  }

  remove(id: number) {
    return `This action removes a #${id} requisitoEntregado`;
  }
}
