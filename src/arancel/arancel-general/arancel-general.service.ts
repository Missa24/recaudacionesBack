import { Injectable } from '@nestjs/common';
import { CreateArancelGeneralDto } from './dto/create-arancel-general.dto';
import { UpdateArancelGeneralDto } from './dto/update-arancel-general.dto';

@Injectable()
export class ArancelGeneralService {
  create(createArancelGeneralDto: CreateArancelGeneralDto) {
    return 'This action adds a new arancelGeneral';
  }

  findAll() {
    return `This action returns all arancelGeneral`;
  }

  findOne(id: number) {
    return `This action returns a #${id} arancelGeneral`;
  }

  update(id: number, updateArancelGeneralDto: UpdateArancelGeneralDto) {
    return `This action updates a #${id} arancelGeneral`;
  }

  remove(id: number) {
    return `This action removes a #${id} arancelGeneral`;
  }
}
