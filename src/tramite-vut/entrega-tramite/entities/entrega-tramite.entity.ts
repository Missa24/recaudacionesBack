/**
 * Módulo: Trámites VUT - Evento Trámite
 * Archivo: evento_tramite.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad EventoTramite,
 * correspondiente a la tabla evento_tramite del esquema tramite.
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
 * Representa la bitácora de estados y eventos de un trámite.
 */
@Entity({ schema: 'tramite_vut', name: 'evento_tramite' })
export class EventoTramite {
  /*
   * Identificador único del evento.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id_evento' })
  id_evento!: string;

  /*
   * Identificador del trámite asociado.
   */
  @Column({ type: 'uuid', name: 'tramite_id' })
  tramite_id!: string;

  /*
   * Relación con el trámite.
   */
  @ManyToOne(() => Tramite, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'tramite_id',
    referencedColumnName: 'id_tramite',
  })
  tramite!: Tramite;

  /*
   * Estado anterior del trámite.
   */
  @Column({ type: 'text', nullable: true })
  estado_anterior!: string | null;

  /*
   * Estado nuevo del trámite.
   */
  @Column({ type: 'text' })
  estado_nuevo!: string;

  /*
   * Número informativo del paso del flujo.
   */
  @Column({ type: 'smallint', nullable: true })
  paso!: number | null;

  /*
   * Identificación textual del actor.
   */
  @Column({ type: 'varchar', length: 40 })
  actor!: string;

  /*
   * Identificador del usuario asociado al evento.
   */
  @Column({ type: 'uuid', name: 'usuario_id', nullable: true })
  usuario_id!: string | null;

  /*
   * Relación con el usuario asociado al evento.
   */
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({
    name: 'usuario_id',
    referencedColumnName: 'idUsuario',
  })
  usuario!: Usuario | null;

  /*
   * Fecha y hora del evento.
   */
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  fecha!: Date;

  /*
   * Observaciones del evento.
   */
  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  /*
   * Información adicional del evento.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  /*
   * Estado del registro: ACTIVO o INACTIVO.
   */
  @Column({ type: 'text', default: 'ACTIVO' })
  estado!: string;

  /*
   * Fecha de creación.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'clock_timestamp()',
  })
  _created_at!: Date;

  /*
   * Fecha de actualización.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  _updated_at!: Date;

  /*
   * Fecha de baja lógica.
   */
  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  _deleted_at!: Date | null;

  /*
   * Identificador del usuario que creó el registro.
   */
  @Column({ type: 'uuid', name: '_user_created' })
  _user_created!: string;

  /*
   * Relación con el usuario creador.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'idUsuario',
  })
  usuarioCreador!: Usuario;

  /*
   * Identificador del usuario que actualizó el registro.
   */
  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  _user_update!: string | null;

  /*
   * Relación con el usuario actualizador.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'idUsuario',
  })
  usuarioActualizador!: Usuario | null;

  /*
   * Identificador del usuario que realizó la baja lógica.
   */
  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  _user_delete!: string | null;

  /*
   * Relación con el usuario eliminador.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'idUsuario',
  })
  usuarioEliminador!: Usuario | null;
}
