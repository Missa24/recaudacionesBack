import { Injectable } from '@nestjs/common';
import { CreateDerivacionDto } from './dto/create-derivacion.dto';
import { UpdateDerivacionDto } from './dto/update-derivacion.dto';

@Injectable()
export class DerivacionService {
  create(createDerivacionDto: CreateDerivacionDto) {
    return 'This action adds a new derivacion';
  }

  findAll() {
    return `This action returns all derivacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} derivacion`;
  }

  update(id: number, updateDerivacionDto: UpdateDerivacionDto) {
    return `This action updates a #${id} derivacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} derivacion`;
  }
}
