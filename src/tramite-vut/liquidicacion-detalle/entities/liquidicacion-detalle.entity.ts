/**
 * Módulo: Trámites VUT - Detalle de Liquidación
 * Archivo: liquidacion-detalle.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad LiquidacionDetalle,
 * correspondiente a la tabla liquidacion_detalle del esquema tramite_vut.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { ArancelDetalle } from 'src/arancel/arancel-detalle/entities/arancel-detalle.entity';
import { Tarifa } from 'src/arancel/tarifa/entities/tarifa.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Liquidacion } from 'src/tramite-vut/liquidacion/entities/liquidacion.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Entidad LiquidacionDetalle.
 * Representa los conceptos, cantidades y precios
 * asociados a una liquidación.
 *
 * La relación con Tarifa utiliza una FK compuesta.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'liquidacion_detalle' })
export class LiquidacionDetalle {
  // Identificador único

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Claves foráneas

  @Column({ type: 'uuid', name: 'liquidacion_id' })
  liquidacion_id!: string;

  @Column({ type: 'uuid', name: 'arancel_det_id' })
  arancel_det_id!: string;

  @Column({ type: 'uuid', name: 'tarifa_id' })
  tarifa_id!: string;

  @Column({ type: 'uuid', name: '_user_created' })
  usuarios_created_id!: string;

  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  usuarios_update_id!: string | null;

  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  usuarios_delete_id!: string | null;

  // Relaciones

  @ManyToOne(() => Liquidacion, (liquidacion) => liquidacion.detalles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'liquidacion_id',
    referencedColumnName: 'id',
  })
  liquidacion!: Liquidacion;

  @ManyToOne(() => ArancelDetalle, {
    nullable: false,
  })
  @JoinColumn({
    name: 'arancel_det_id',
    referencedColumnName: 'id',
  })
  arancelDetalle!: ArancelDetalle;

  /*
   * Relación con tarifa mediante FK compuesta.
   */
  @ManyToOne(() => Tarifa, {
    nullable: false,
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

  // Datos del detalle

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  precio_unitario!: string;

  /*
   * Subtotal generado por PostgreSQL.
   * No se envía en INSERT ni UPDATE.
   */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    insert: false,
    update: false,
    nullable: true,
    asExpression: 'cantidad::numeric * precio_unitario',
    generatedType: 'STORED',
  })
  subtotal!: string | null;

  @Column({ type: 'varchar', length: 70, nullable: true })
  nro_extracto!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  codigo_certificado!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  codigo_resolucion!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  rango_vendidos!: string | null;

  @Column({ type: 'text' })
  descripcion_aplicada!: string;

  // Estado del registro

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVO',
  })
  estado!: string;

  // Auditoría

  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt!: Date;

  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt!: Date;

  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  deletedAt!: Date | null;

  // Relaciones de auditoría

  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'id',
  })
  usuarioCreador!: Usuario;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'id',
  })
  usuarioActualizador!: Usuario | null;

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
