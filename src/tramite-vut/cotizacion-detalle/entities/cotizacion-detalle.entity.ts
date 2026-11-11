/**
 * Módulo: Trámites - Detalle de Cotización
 * Archivo: cotizacion_detalle.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad CotizacionDetalle,
 * correspondiente a la tabla cotizacion_detalle del esquema tramite.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { ArancelDetalle } from 'src/arancel/arancel-detalle/entities/arancel-detalle.entity';
import { Tarifa } from 'src/arancel/tarifa/entities/tarifa.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Cotizacion } from 'src/tramite-vut/cotizacion/entities/cotizacion.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';

/**
 * Entidad CotizacionDetalle.
 * Representa los ítems de una cotización.
 *
 * Conserva la descripción y el precio unitario
 * aplicados al momento de generar la cotización.
 *
 * El subtotal es calculado y almacenado por PostgreSQL.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'cotizacion_detalle' })
@Check('cotizacion_detalle_cantidad_check', '"cantidad" > 0')
@Check('cotizacion_detalle_precio_unitario_check', '"precio_unitario" >= 0')
export class CotizacionDetalle {
  /*
   * Identificador único del detalle.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /*
   * Identificador de la cotización.
   */
  @Column({
    type: 'uuid',
    name: 'cotizacion_id',
  })
  cotizacion_id!: string;

  /*
   * Identificador del detalle arancelario.
   */
  @Column({
    type: 'uuid',
    name: 'arancel_det_id',
  })
  arancel_det_id!: string;

  /*
   * Identificador de la tarifa.
   */
  @Column({
    type: 'uuid',
    name: 'tarifa_id',
  })
  tarifa_id!: string;

  /*
   * Relación con la cotización.
   */
  @ManyToOne(() => Cotizacion, (cotizacion) => cotizacion.detalles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'cotizacion_id',
    referencedColumnName: 'id',
  })
  cotizacion!: Cotizacion;

  /*
   * Relación con el detalle arancelario.
   */
  @ManyToOne(() => ArancelDetalle, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'arancel_det_id',
    referencedColumnName: 'id',
  })
  arancel_det!: ArancelDetalle;

  /*
   * Relación con la tarifa.
   *
   * FK compuesta:
   * tarifa_id + arancel_det_id.
   */
  @ManyToOne(() => Tarifa, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'tarifa_id',
      referencedColumnName: 'id',
    },
    {
      name: 'arancel_det_id',
      referencedColumnName: 'id',
    },
  ])
  tarifa!: Tarifa;

  /*
   * Descripción del concepto conservada al cotizar.
   */
  @Column({
    type: 'text',
    name: 'descripcion_aplicada',
  })
  descripcion_aplicada!: string;

  /*
   * Cantidad de unidades.
   */
  @Column({
    type: 'integer',
    name: 'cantidad',
  })
  cantidad!: number;

  /*
   * Precio unitario.
   */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'precio_unitario',
  })
  precio_unitario!: string;

  /*
   * Subtotal generado y almacenado por PostgreSQL.
   * No enviar en INSERT ni UPDATE.
   */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    insert: false,
    update: false,
    nullable: true,
    asExpression: '(cantidad::numeric * precio_unitario)',
    generatedType: 'STORED',
  })
  subtotal!: string | null;

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

  /*
   * Identificador del usuario creador.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  _user_created!: string;

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
   * Identificador del usuario actualizador.
   */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  _user_update!: string | null;

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
   * Identificador del usuario que realizó la baja lógica.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

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
}
