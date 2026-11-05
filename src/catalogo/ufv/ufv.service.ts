import { Injectable } from '@nestjs/common';
import { CreateUfvDto } from './dto/create-ufv.dto';
import { UpdateUfvDto } from './dto/update-ufv.dto';

@Injectable()
export class UfvService {
  create(createUfvDto: CreateUfvDto) {
    return 'This action adds a new ufv';
  }

  findAll() {
    return `This action returns all ufv`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ufv`;
  }

  update(id: number, updateUfvDto: UpdateUfvDto) {
    return `This action updates a #${id} ufv`;
  }

  remove(id: number) {
    return `This action removes a #${id} ufv`;
  }
}
