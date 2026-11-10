import { PersonaJuridica } from '../entities/persona-juridica.entity';
import { PersonaJuridicaResponse } from '../interface/persona-juridica-response.interface';

/**
 * Convierte una entidad PersonaJuridica a la estructura
 * pública definida para las respuestas del servicio.
 */
export function mapearRespuesta(
  persona: PersonaJuridica,
): PersonaJuridicaResponse {
  return {
    id: persona.id,
    nit: persona.nit,
    razon_social: persona.razon_social,
    domicilio: persona.domicilio,
    telefono: persona.telefono,
    email: persona.email,
    estado: persona.estado,
    responsable_creacion: persona.usuario_creador?.username ?? null,
    responsable_actualizacion: persona.usuario_actualizador?.username ?? null,
  };
}
