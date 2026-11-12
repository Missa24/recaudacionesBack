import { BadRequestException } from '@nestjs/common';

export function validarVigencia(
  vigenteDesde: string,
  vigenteHasta?: string | null,
): void {
  if (
    vigenteHasta !== undefined &&
    vigenteHasta !== null &&
    vigenteHasta <= vigenteDesde
  ) {
    throw new BadRequestException(
      'La fecha de vigencia final debe ser posterior a la fecha inicial.',
    );
  }
}
