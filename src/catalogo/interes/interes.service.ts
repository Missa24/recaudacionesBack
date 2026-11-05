import { Injectable } from '@nestjs/common';
import { CreateIntereDto } from './dto/create-intere.dto';
import { UpdateIntereDto } from './dto/update-intere.dto';

@Injectable()
export class InteresService {
  create(createIntereDto: CreateIntereDto) {
    return 'This action adds a new intere';
  }

  findAll() {
    return `This action returns all interes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} intere`;
  }

  update(id: number, updateIntereDto: UpdateIntereDto) {
    return `This action updates a #${id} intere`;
  }

  remove(id: number) {
    return `This action removes a #${id} intere`;
  }
}
