import { BadRequestException } from '@nestjs/common';

export function validarMonto(monto: number): void {
  if (!Number.isFinite(monto) || monto < 0) {
    throw new BadRequestException(
      'El monto debe ser un número mayor o igual a cero.',
    );
  }
}
