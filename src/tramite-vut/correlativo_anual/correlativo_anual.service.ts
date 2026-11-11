import { Injectable } from '@nestjs/common';
import { CreateCorrelativoAnualDto } from './dto/create-correlativo_anual.dto';
import { UpdateCorrelativoAnualDto } from './dto/update-correlativo_anual.dto';

@Injectable()
export class CorrelativoAnualService {
  create(createCorrelativoAnualDto: CreateCorrelativoAnualDto) {
    return 'This action adds a new correlativoAnual';
  }

  findAll() {
    return `This action returns all correlativoAnual`;
  }

  findOne(id: number) {
    return `This action returns a #${id} correlativoAnual`;
  }

  update(id: number, updateCorrelativoAnualDto: UpdateCorrelativoAnualDto) {
    return `This action updates a #${id} correlativoAnual`;
  }

  remove(id: number) {
    return `This action removes a #${id} correlativoAnual`;
  }
}
