/**
 * Módulo: Shared - Utils
 * Archivo: convertir-fecha.util.ts
 * Descripción:
 * Proporciona una función auxiliar para convertir fechas
 * expresadas en español al formato ISO YYYY-MM-DD.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

/**
 * Convierte una fecha escrita en español al formato ISO.
 *
 * Ejemplo:
 * "15 de enero 2026" -> "2026-01-15"
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export function convertirFechaEspanol(fecha: string): string {
  // Equivalencias de los meses en español.
  const meses: Record<string, string> = {
    enero: '01',
    febrero: '02',
    marzo: '03',
    abril: '04',
    mayo: '05',
    junio: '06',
    julio: '07',
    agosto: '08',
    septiembre: '09',
    octubre: '10',
    noviembre: '11',
    diciembre: '12',
  };

  // Identificar día, mes y año de la fecha recibida.
  const partes = fecha
    .toLowerCase()
    .match(/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+(\d{4})$/);

  if (!partes) {
    throw new Error(`Formato de fecha inválido: ${fecha}`);
  }

  const [, dia, mes, anio] = partes;
  const numeroMes = meses[mes];

  // Validar que el mes exista en las equivalencias.
  if (!numeroMes) {
    throw new Error(`Mes desconocido: ${mes}`);
  }

  // Retornar la fecha en formato ISO.
  return `${anio}-${numeroMes}-${dia.padStart(2, '0')}`;
}
