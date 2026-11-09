import { SetMetadata } from '@nestjs/common';

export const BITACORA_KEY = 'bitacora';
export const BITACORA_IGNORE_KEY = 'bitacora_ignore';

export interface BitacoraOptions {
  tabla: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE';
  omitirDatos?: boolean;
  sistemaId?: string;
}

export const RegistrarBitacora = (options: BitacoraOptions) =>
  SetMetadata(BITACORA_KEY, options);

// Decorador para ignorar la bitácora en endpoints específicos
export const IgnorarBitacora = () =>
  SetMetadata(BITACORA_IGNORE_KEY, true);