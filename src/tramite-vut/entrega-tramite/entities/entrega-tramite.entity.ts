/**
 * Módulo: Trámites VUT - Entrega
 * Archivo: entrega.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Entrega,
 * correspondiente a la tabla entrega del esquema tramite.
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
 * Entidad Entrega.
 * Representa la constancia de entrega de documentos
 * al receptor de un trámite.
 *
 * No se restringe a una sola entrega por trámite.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'entrega' })
export class Entrega {
  /*
   * Identificador único de la entrega.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /*
   * Identificador del trámite asociado.
   */
  @Column({
    type: 'uuid',
    name: 'tramite_id',
  })
  tramite_id!: string;

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
   * Fecha y hora de entrega.
   */
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  fecha_entrega!: Date;

  /*
   * Nombre de la persona que recibe el documento.
   */
  @Column({
    type: 'varchar',
    length: 250,
  })
  nombre_receptor!: string;

  /*
   * Documento de identidad del receptor.
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ci_receptor!: string | null;

  /*
   * Indica si el receptor es el titular del trámite.
   */
  @Column({
    type: 'boolean',
  })
  es_titular!: boolean;

  /*
   * Referencia del poder o documento de respaldo.
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  poder_o_respaldo!: string | null;

  /*
   * Identificador del usuario que registra la entrega.
   */
  @Column({
    type: 'uuid',
    name: 'entregado_por_id',
  })
  entregado_por_id!: string;

  /*
   * Relación con el usuario que registra la entrega.
   */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'entregado_por_id',
    referencedColumnName: 'id',
  })
  entregadoPor!: Usuario;

  /*
   * Observaciones de la entrega.
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  observacion!: string | null;

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

  /*
   * Identificador del usuario creador.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  usuario_created_id!: string;

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
   * Identificador del usuario actualizador.
   */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  usuario_update_id!: string | null;

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
   * Identificador del usuario que realizó la baja lógica.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  usuario_delete_id!: string | null;

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
}
