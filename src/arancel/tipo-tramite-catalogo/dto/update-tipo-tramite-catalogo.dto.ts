import { PartialType } from '@nestjs/swagger';
import { CreateTipoTramiteCatalogoDto } from './create-tipo-tramite-catalogo.dto';

export class UpdateTipoTramiteCatalogoDto extends PartialType(
  CreateTipoTramiteCatalogoDto,
) {}
