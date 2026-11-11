import { Injectable } from '@nestjs/common';
import { CreateArancelRangoDto } from './dto/create-arancel-rango.dto';
import { UpdateArancelRangoDto } from './dto/update-arancel-rango.dto';

@Injectable()
export class ArancelRangoService {
  create(createArancelRangoDto: CreateArancelRangoDto) {
    return 'This action adds a new arancelRango';
  }

  findAll() {
    return `This action returns all arancelRango`;
  }

  findOne(id: number) {
    return `This action returns a #${id} arancelRango`;
  }

  update(id: number, updateArancelRangoDto: UpdateArancelRangoDto) {
    return `This action updates a #${id} arancelRango`;
  }

  remove(id: number) {
    return `This action removes a #${id} arancelRango`;
  }
}
