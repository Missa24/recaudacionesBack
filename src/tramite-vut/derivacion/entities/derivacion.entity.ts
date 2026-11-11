/**
 * Módulo: Trámites VUT - Derivación
 * Archivo: derivacion.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Derivacion,
 * correspondiente a la tabla derivacion del esquema tramite_vut.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';
import { Dependencia } from 'src/catalogo/dependencia/entities/dependencia.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';

/**
 * Entidad Derivacion.
 * Representa el movimiento de un expediente hacia una dependencia.
 *
 * Pueden existir varias derivaciones para un mismo trámite.
 * La vista correspondiente selecciona la última derivación activa.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'derivacion' })
@Check(
  'derivacion_check',
  '"fecha_recepcion" IS NULL OR "fecha_recepcion" >= "fecha_derivacion"',
)
export class Derivacion {
  /*
   * Identificador único de la derivación.
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
   * Identificador de la dependencia de destino.
   */
  @Column({
    type: 'uuid',
    name: 'dependencia_destino_id',
  })
  dependencia_destino_id!: string;

  /*
   * Identificador del usuario creador.
   * Administrado por el trigger.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  usuarios_created_id!: string;

  /*
   * Identificador del usuario actualizador.
   * Administrado por el trigger.
   */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  usuarios_update_id!: string | null;

  /*
   * Identificador del usuario que realizó la baja lógica.
   * Administrado por el trigger.
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
    referencedColumnName: 'id_tramite',
  })
  tramite!: Tramite;

  /*
   * Relación con la dependencia de destino.
   */
  @ManyToOne(() => Dependencia, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'dependencia_destino_id',
    referencedColumnName: 'id_dependencia',
  })
  dependenciaDestino!: Dependencia;

  /*
   * Relación con el usuario creador.
   */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'idUsuario',
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
    referencedColumnName: 'idUsuario',
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
    referencedColumnName: 'idUsuario',
  })
  usuarioEliminador!: Usuario | null;

  /*
   * Fecha y hora de envío a la dependencia destino.
   */
  @Column({
    type: 'timestamptz',
    name: 'fecha_derivacion',
    default: () => 'now()',
  })
  fecha_derivacion!: Date;

  /*
   * Estado operativo de la derivación.
   */
  @Column({
    type: 'enum',
    enumName: 'estado_derivacion',
    default: 'PENDIENTE',
  })
  estado_derivacion!: string;

  /*
   * Nombre textual de quien recibe la derivación.
   */
  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  recibido_por!: string | null;

  /*
   * Fecha y hora de recepción.
   */
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  fecha_recepcion!: Date | null;

  /*
   * Observaciones de la derivación.
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
  _created_at!: Date;

  /*
   * Fecha y hora de última actualización.
   * Administrada por el trigger.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  _updated_at!: Date;

  /*
   * Fecha y hora de baja lógica.
   */
  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  _deleted_at!: Date | null;
}
