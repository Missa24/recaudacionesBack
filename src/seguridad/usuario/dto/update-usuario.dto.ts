import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

/**
 * Permite editar parcialmente los datos del usuario.
 * No incluye estado ni campos de auditoría.
 */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
