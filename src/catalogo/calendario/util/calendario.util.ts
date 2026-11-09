/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario.util.ts
 * Descripción:
 * Contiene funciones auxiliares para la validación
 * y determinación de días hábiles del calendario.
 *
 * Desarrollado por: Missael Apaza
 */

import { BadRequestException } from '@nestjs/common';

/**
 * Valida que una fecha tenga el formato YYYY-MM-DD
 * y corresponda a una fecha válida.
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

/**
 * Determina si una fecha corresponde a un día hábil
 * considerando de lunes a viernes como días laborables.
 */
export function calcularDiaHabil(fecha: string): boolean {
  validarFecha(fecha);

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();

  return diaSemana !== 0 && diaSemana !== 6;
}
