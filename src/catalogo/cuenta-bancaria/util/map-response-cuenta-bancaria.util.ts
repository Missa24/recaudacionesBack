import { CuentaBancaria } from '../entities/cuenta-bancaria.entity';
import { CuentaBancariaResponse } from '../interfaces/cuenta-bancaria-response.interface';

/**
 * Convierte una entidad CuentaBancaria a la estructura
 * pública definida para las respuestas del servicio.
 */
export function mapearRespuesta(
  cuenta: CuentaBancaria,
): CuentaBancariaResponse {
  return {
    id: cuenta.id,
    banco_id: cuenta.banco_id,
    dependencia_id: cuenta.dependencia_id,
    nro_cuenta: cuenta.nro_cuenta,
    nombre_cuenta: cuenta.nombre_cuenta,
    tipo: cuenta.tipo,
    estado: cuenta.estado,
    responsable_creacion: cuenta.usuario_creador
      ? cuenta.usuario_creador.username
      : null,
    responsable_actualizacion: cuenta.usuario_actualizador
      ? cuenta.usuario_actualizador.username
      : null,
  };
}
