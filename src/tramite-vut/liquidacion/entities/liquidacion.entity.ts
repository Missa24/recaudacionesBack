/**
 * Módulo: Trámites VUT - Liquidación
 * Archivo: liquidacion.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Liquidacion,
 * correspondiente a la tabla liquidacion del esquema tramite_vut.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { LiquidacionDetalle } from 'src/tramite-vut/liquidicacion-detalle/entities/liquidicacion-detalle.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
  Check,
} from 'typeorm';

/**
 * Entidad Liquidacion.
 * Representa el documento de cobro por los servicios de un trámite.
 *
 * El total se valida contra sus detalles.
 * La anulación requiere obligatoriamente un motivo.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'liquidacion' })
@Unique('liquidacion_nro_liquidacion_key', ['nro_liquidacion'])
@Check(
  'liquidacion_check',
  `(
    (NOT "anulado" AND "motivo_anulacion" IS NULL)
    OR
    (
      "anulado"
      AND "motivo_anulacion" IS NOT NULL
      AND length(btrim("motivo_anulacion")) > 0
    )
  )`,
)
@Check('liquidacion_monto_total_check', '"monto_total" >= 0')
export class Liquidacion {
  /*
   * Identificador único de la liquidación.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id_liquidacion' })
  id!: string;

  // Claves foráneas

  /*
   * Identificador del trámite asociado.
   */
  @Column({ type: 'uuid', name: 'tramites_id' })
  tramites_id!: string;

  /*
   * Identificador del usuario responsable de la liquidación.
   */
  @Column({ type: 'uuid', name: 'usuarios_id' })
  usuarios_id!: string;

  /*
   * Identificador del usuario creador.
   */
  @Column({ type: 'uuid', name: '_user_created' })
  usuarios_created_id!: string;

  /*
   * Identificador del usuario actualizador.
   */
  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  usuarios_update_id!: string | null;

  /*
   * Identificador del usuario que realizó la baja lógica.
   */
  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  usuarios_delete_id!: string | null;

  // Relaciones

  /*
   * Relación con el trámite.
   */
  @ManyToOne(() => Tramite, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'tramites_id',
    referencedColumnName: 'id',
  })
  tramite!: Tramite;

  /*
   * Relación con el usuario responsable de la liquidación.
   */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'usuarios_id',
    referencedColumnName: 'id',
  })
  usuario!: Usuario;

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
   * Relación con el usuario eliminador.
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

  // Datos de la liquidación

  /*
   * Número único de liquidación.
   */
  @Column({ type: 'varchar', length: 20, name: 'nro_liquidacion' })
  nro_liquidacion!: string;

  /*
   * Fecha y hora de emisión.
   */
  @Column({
    type: 'timestamptz',
    name: 'fecha_liquidacion',
    default: () => 'now()',
  })
  fecha_liquidacion!: Date;

  /*
   * Monto total de la liquidación.
   */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'monto_total',
  })
  monto_total!: string;

  /*
   * Forma de pago informativa.
   */
  @Column({
    type: 'varchar',
    length: 80,
    name: 'forma_pago',
    nullable: true,
  })
  forma_pago!: string | null;

  /*
   * Glosa o concepto general del cobro.
   */
  @Column({
    type: 'varchar',
    length: 255,
    name: 'glosa',
    nullable: true,
  })
  glosa!: string | null;

  /*
   * Indica si la liquidación fue anulada.
   */
  @Column({
    type: 'boolean',
    name: 'anulado',
    default: false,
  })
  anulado!: boolean;

  /*
   * Motivo obligatorio cuando la liquidación está anulada.
   */
  @Column({
    type: 'text',
    name: 'motivo_anulacion',
    nullable: true,
  })
  motivo_anulacion!: string | null;

  /*
   * Observaciones adicionales.
   */
  @Column({
    type: 'text',
    name: 'observaciones',
    nullable: true,
  })
  observaciones!: string | null;

  /*
   * Estado del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVO',
  })
  estado!: string;

  // Auditoría

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

  /*
   * Detalles asociados a la liquidación.
   */
  @OneToMany(() => LiquidacionDetalle, (detalle) => detalle.liquidacion)
  detalles!: LiquidacionDetalle[];
}
