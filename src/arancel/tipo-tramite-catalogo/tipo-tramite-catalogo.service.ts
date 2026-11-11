import { Injectable } from '@nestjs/common';
import { CreateTipoTramiteCatalogoDto } from './dto/create-tipo-tramite-catalogo.dto';
import { UpdateTipoTramiteCatalogoDto } from './dto/update-tipo-tramite-catalogo.dto';

@Injectable()
export class TipoTramiteCatalogoService {
  create(createTipoTramiteCatalogoDto: CreateTipoTramiteCatalogoDto) {
    return 'This action adds a new tipoTramiteCatalogo';
  }

  findAll() {
    return `This action returns all tipoTramiteCatalogo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoTramiteCatalogo`;
  }

  update(id: number, updateTipoTramiteCatalogoDto: UpdateTipoTramiteCatalogoDto) {
    return `This action updates a #${id} tipoTramiteCatalogo`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoTramiteCatalogo`;
  }
}
