/**
 * Módulo: Trámites VUT - Liquidación
 * Archivo: liquidacion.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Liquidacion,
 * correspondiente a la tabla liquidacion del esquema tramite.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';
import { LiquidacionDetalle } from 'src/tramite_vut/liquidacion_detalle/entities/liquidacion_detalle.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

/**
 * Entidad Liquidacion.
 * Representa el documento de cobro por los servicios de un trámite.
 */
@Entity({ schema: 'tramite', name: 'liquidacion' })
export class Liquidacion {
  /*
   * Identificador único de la liquidación.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id_liquidacion' })
  id_liquidacion!: string;

  /*
   * Identificador del trámite asociado.
   */
  @Column({ type: 'uuid', name: 'id_tramite' })
  id_tramite!: string;

  /*
   * Relación con el trámite.
   */
  @ManyToOne(() => Tramite, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_tramite',
    referencedColumnName: 'id_tramite',
  })
  tramite!: Tramite;

  /*
   * Número único de liquidación.
   */
  @Column({ type: 'varchar', length: 20, unique: true })
  nro_liquidacion!: string;

  /*
   * Fecha de emisión de la liquidación.
   */
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  fecha_liquidacion!: Date;

  /*
   * Monto total de la liquidación.
   * Se almacena como string por la precisión numeric(14,2).
   */
  @Column({ type: 'numeric', precision: 14, scale: 2 })
  monto_total!: string;

  /*
   * Forma de pago informativa.
   */
  @Column({ type: 'varchar', length: 80, nullable: true })
  forma_pago!: string | null;

  /*
   * Glosa o concepto general del cobro.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  glosa!: string | null;

  /*
   * Indica si la liquidación fue anulada.
   */
  @Column({ type: 'boolean', default: false })
  anulado!: boolean;

  /*
   * Motivo obligatorio cuando la liquidación está anulada.
   */
  @Column({ type: 'text', nullable: true })
  motivo_anulacion!: string | null;

  /*
   * Identificador del usuario responsable de la liquidación.
   */
  @Column({ type: 'uuid', name: 'id_usuario' })
  id_usuario!: string;

  /*
   * Relación con el usuario responsable de la liquidación.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario',
    referencedColumnName: 'idUsuario',
  })
  usuario!: Usuario;

  /*
   * Observaciones adicionales.
   */
  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  /*
   * Estado del registro: ACTIVO o INACTIVO.
   */
  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  /*
   * Fecha de creación.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _created_at!: Date;

  /*
   * Fecha de actualización.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'CURRENT_TIMESTAMP',
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

  @OneToMany(() => LiquidacionDetalle, (detalle) => detalle.liquidacion)
  detalles!: LiquidacionDetalle[];
}
