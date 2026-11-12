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
 * Representa la bitácora de estados y eventos de un trámite.
 *
 * Registra el estado anterior, estado nuevo, paso del flujo,
 * actor responsable, fecha, observaciones y metadatos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'evento_tramite' })
export class EventoTramite {
  /*
   * Identificador único del evento.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /*
   * Identificador del trámite asociado.
   * FK: tramite_id.
   */
  @Column({
    type: 'uuid',
    name: 'tramite_id',
  })
  tramite_id!: string;

  /*
   * Identificador del usuario asociado al evento.
   * FK: usuario_id. Puede ser nulo.
   */
  @Column({
    type: 'uuid',
    name: 'usuario_id',
    nullable: true,
  })
  usuario_id!: string | null;

  /*
   * Identificador del usuario creador.
   * Columna física: _user_created.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  usuarios_created_id!: string;

  /*
   * Identificador del usuario actualizador.
   * Columna física: _user_update.
   */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  usuarios_update_id!: string | null;

  /*
   * Identificador del usuario que realizó la baja lógica.
   * Columna física: _user_delete.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  usuarios_delete_id!: string | null;

  /*
   * Relación con el trámite.
   */
  @ManyToOne(() => Tramite, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'tramite_id',
    referencedColumnName: 'id',
  })
  tramite!: Tramite;

  /*
   * Relación con el usuario asociado al evento.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'usuario_id',
    referencedColumnName: 'id',
  })
  usuario!: Usuario | null;

  /*
   * Relación con el usuario creador.
   */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'id',
  })
  usuarioCreador!: Usuario;

  /*
   * Relación con el usuario actualizador.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'id',
  })
  usuarioActualizador!: Usuario | null;

  /*
   * Relación con el usuario que realizó la baja lógica.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'id',
  })
  usuarioEliminador!: Usuario | null;

  /*
   * Estado anterior del trámite.
   * NULL cuando corresponde al evento inicial.
   */
  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  estado_anterior!: string | null;

  /*
   * Estado nuevo del trámite.
   */
  @Column({
    type: 'varchar',
    length: 40,
  })
  estado_nuevo!: string;

  /*
   * Número informativo del paso del flujo.
   */
  @Column({
    type: 'smallint',
    nullable: true,
  })
  paso!: number | null;

  /*
   * Identificación textual del actor.
   */
  @Column({
    type: 'varchar',
    length: 40,
  })
  actor!: string;

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
  @Column({
    type: 'text',
    nullable: true,
  })
  observacion!: string | null;

  /*
   * Información adicional en formato JSONB.
   */
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, unknown> | null;

  /*
   * Estado del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVO',
  })
  estado!: string;

  /*
   * Fecha y hora de creación.
   * Administrada por el trigger.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt!: Date;

  /*
   * Fecha y hora de última actualización.
   * Administrada por el trigger.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt!: Date;

  /*
   * Fecha y hora de baja lógica.
   */
  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  deletedAt!: Date | null;
}
