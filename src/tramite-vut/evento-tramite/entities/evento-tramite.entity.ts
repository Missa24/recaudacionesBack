/**
 * Módulo: Trámite VUT - Evento de Trámite
 * Archivo: evento_tramite.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad EventoTramite,
 * correspondiente a la tabla evento_tramite del esquema tramite_vut.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Entidad EventoTramite.
 * Representa un evento o transición de estado ocurrido sobre un trámite,
 * incluyendo el estado anterior y nuevo, el paso, el actor, la fecha,
 * observaciones y metadatos adicionales.
 *
 * Cada evento está asociado a un trámite y opcionalmente a un usuario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
@Entity({ schema: 'tramite-vut', name: 'evento_tramite' })
export class EventoTramite {
  /*
   * Identificador único del evento de trámite.
   * UUID generado automáticamente por la base de datos.
   * Columna BD: id_evento.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK

  /*
   * Identificador del trámite al que pertenece el evento.
   * Columna BD: id_tramite.
   */
  @Column({ type: 'uuid', name: 'tramites_id' })
  tramites_id!: string;

  /*
   * Identificador del usuario asociado al evento.
   * Columna BD: id_usuario. Puede ser nulo.
   */
  @Column({ type: 'uuid', name: 'usuarios_id', nullable: true })
  usuarios_id!: string | null;

  /*
   * Identificador del usuario que creó el registro.
   * Columna BD: _user_created.
   */
  @Column({ type: 'uuid', name: '_user_created' })
  usuarios_created_id!: string;

  /*
   * Identificador del usuario que actualizó el registro.
   * Columna BD: _user_update. Puede ser nulo.
   */
  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  usuarios_update_id!: string | null;

  /*
   * Identificador del usuario que realizó la baja lógica del registro.
   * Columna BD: _user_delete. Puede ser nulo.
   */
  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  usuarios_delete_id!: string | null;

  /*
   * Relación con el trámite al que pertenece el evento.
   */
  @ManyToOne(() => Tramite)
  @JoinColumn({ name: 'tramites_id', referencedColumnName: 'id' })
  tramite!: Tramite;

  /*
   * Relación con el usuario asociado al evento (opcional).
   */
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuarios_id', referencedColumnName: 'idUsuario' })
  usuario!: Usuario | null;

  /*
   * Relación con el usuario responsable de la creación.
   */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: '_user_created', referencedColumnName: 'idUsuario' })
  usuarioCreador!: Usuario;

  /*
   * Relación con el usuario responsable de la actualización.
   */
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: '_user_update', referencedColumnName: 'idUsuario' })
  usuarioActualizador!: Usuario | null;

  /*
   * Relación con el usuario responsable de la baja lógica.
   */
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: '_user_delete', referencedColumnName: 'idUsuario' })
  usuarioEliminador!: Usuario | null;

  // Atributos

  /*
   * Estado anterior del trámite antes del evento.
   * Longitud máxima: 40 caracteres. Puede ser nulo.
   */
  @Column({ type: 'varchar', length: 40, nullable: true })
  estado_anterior!: string | null;

  /*
   * Estado nuevo del trámite después del evento.
   * Longitud máxima: 40 caracteres.
   */
  @Column({ type: 'varchar', length: 40 })
  estado_nuevo!: string;

  /*
   * Paso del flujo en el que ocurrió el evento.
   * Puede ser nulo.
   */
  @Column({ type: 'smallint', nullable: true })
  paso!: number | null;

  /*
   * Actor que ejecutó el evento (por ejemplo: SISTEMA, FUNCIONARIO, CIUDADANO).
   * Longitud máxima: 40 caracteres.
   */
  @Column({ type: 'varchar', length: 40 })
  actor!: string;

  /*
   * Fecha y hora en que ocurrió el evento.
   */
  @Column({ type: 'timestamptz' })
  fecha!: Date;

  /*
   * Observaciones adicionales del evento.
   * Puede ser nulo.
   */
  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  /*
   * Metadatos adicionales del evento en formato JSON.
   * Puede ser nulo.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  /*
   * Estado del registro: ACTIVO o INACTIVO.
   * Por defecto: 'ACTIVO'.
   */
  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  /*
   * Fecha y hora de creación del registro.
   * Por defecto: CURRENT_TIMESTAMP.
   */
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  _created_at!: Date;

  /*
   * Fecha y hora de la última actualización del registro.
   * Por defecto: CURRENT_TIMESTAMP.
   */
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  _updated_at!: Date;

  /*
   * Fecha y hora de eliminación lógica del registro.
   * Puede ser nula si no fue eliminado.
   */
  @Column({ type: 'timestamptz', nullable: true })
  _deleted_at!: Date | null;
}
