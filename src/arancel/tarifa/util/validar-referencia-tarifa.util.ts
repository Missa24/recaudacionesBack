import { BadRequestException } from '@nestjs/common';

export function validarReferencia(referencia: string): void {
  if (!referencia || referencia.trim().length === 0) {
    throw new BadRequestException(
      'La referencia de aprobación no puede estar vacía.',
    );
  }
}
