/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario-validar-fecha.util.ts
 * Descripción:
 * Contiene la función auxiliar para la validación
 * del formato y validez de fechas del calendario.
 *
 * Desarrollado por: Missael Apaza
 */

import { BadRequestException } from '@nestjs/common';

/**
 * Valida que una fecha tenga el formato YYYY-MM-DD
 * y corresponda a una fecha válida.
 *
 * Desarrollado por: Missael Apaza
 */
export function validarFecha(fecha: string): void {
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fecha)) {
    throw new BadRequestException('La fecha debe tener el formato YYYY-MM-DD.');
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);

  const fechaValidada = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fechaValidada.getUTCFullYear() !== anio ||
    fechaValidada.getUTCMonth() !== mes - 1 ||
    fechaValidada.getUTCDate() !== dia
  ) {
    throw new BadRequestException('La fecha proporcionada no es válida.');
  }
}
