/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario-dia-habil.util.ts
 * Descripción:
 * Contiene la función auxiliar para determinar
 * si una fecha corresponde a un día hábil.
 *
 * Desarrollado por: Missael Apaza
 */

import { validarFecha } from './calendario-validar-fecha.util';

/**
 * Determina si una fecha corresponde a un día hábil
 * considerando de lunes a viernes como días laborables.
 *
 * Desarrollado por: Missael Apaza
 */
export function calcularDiaHabil(fecha: string): boolean {
  validarFecha(fecha);

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();

  return diaSemana !== 0 && diaSemana !== 6;
}
