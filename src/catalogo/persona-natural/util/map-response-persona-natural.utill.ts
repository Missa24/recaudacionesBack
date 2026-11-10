import { PersonaNatural } from '../entities/persona-natural.entity';
import { PersonaNaturalResponse } from '../interface/persona-natural-response.interface';

/**
 * Convierte una entidad PersonaNatural a la estructura
 * pública definida para las respuestas del servicio.
 *
 * Desarrollado por: Missael Apaza
 */
export function mapearRespuesta(
  persona: PersonaNatural,
): PersonaNaturalResponse {
  return {
    id: persona.id,
    tipo_documento: persona.tipo_documento,
    numero_documento: persona.numero_documento,
    complemento: persona.complemento,
    expedido: persona.expedido,
    nombres: persona.nombres,
    apellido_paterno: persona.apellido_paterno,
    apellido_materno: persona.apellido_materno,
    domicilio: persona.domicilio,
    telefono: persona.telefono,
    email: persona.email,
    fecha_nacimiento: persona.fecha_nacimiento,
    apellido_casada: persona.apellido_casada,
    estado_civil: persona.estado_civil,
    estado: persona.estado,
    responsable_creacion: persona.usuario_creador?.username ?? null,
    responsable_actualizacion: persona.usuario_actualizador?.username ?? null,
  };
}
