export function generarFechasDelRango(inicio: string, fin: string): string[] {
  const fechas: string[] = [];

  const [anioI, mesI, diaI] = inicio.split('-').map(Number);
  const [anioF, mesF, diaF] = fin.split('-').map(Number);

  const cursor = new Date(Date.UTC(anioI, mesI - 1, diaI));
  const limite = new Date(Date.UTC(anioF, mesF - 1, diaF));

  while (cursor <= limite) {
    const anio = cursor.getUTCFullYear();
    const mes = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(cursor.getUTCDate()).padStart(2, '0');
    fechas.push(`${anio}-${mes}-${dia}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return fechas;
}
