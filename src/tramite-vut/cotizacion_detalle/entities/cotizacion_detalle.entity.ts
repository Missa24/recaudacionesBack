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
} from 'typeorm';

@Entity({ schema: 'tramite', name: 'cotizacion_detalle' })
export class CotizacionDetalle {
  /*
   * Identificador único del detalle.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id_detalle' })
  id_detalle!: string;

  /*
   * Identificador de la cotización.
   */
  @Column({ type: 'uuid', name: 'id_cotizacion' })
  id_cotizacion!: string;

  /*
   * Identificador del detalle arancelario.
   */
  @Column({ type: 'uuid', name: 'id_arancel_det' })
  id_arancel_det!: string;

  /*
   * Identificador de la tarifa.
   */
  @Column({ type: 'uuid', name: 'id_tarifa' })
  id_tarifa!: string;

  /*
   * Relación con la cotización.
   */
  @ManyToOne(() => Cotizacion, (cotizacion) => cotizacion.detalles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_cotizacion',
    referencedColumnName: 'id_cotizacion',
  })
  cotizacion!: Cotizacion;

  /*
   * Relación con el detalle arancelario.
   */
  @ManyToOne(() => ArancelDetalle, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_arancel_det',
    referencedColumnName: 'id_arancel_det',
  })
  arancel_det!: ArancelDetalle;

  /*
   * Relación con la tarifa.
   * La FK es compuesta: id_tarifa + id_arancel_det.
   */
  @ManyToOne(() => Tarifa, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn([
    {
      name: 'id_tarifa',
      referencedColumnName: 'id_tarifa',
    },
    {
      name: 'id_arancel_det',
      referencedColumnName: 'id_arancel_det',
    },
  ])
  tarifa!: Tarifa;

  /*
   * Descripción conservada al momento de cotizar.
   */
  @Column({ type: 'text' })
  descripcion_aplicada!: string;

  /*
   * Cantidad de unidades.
   */
  @Column({ type: 'integer' })
  cantidad!: number;

  /*
   * Precio unitario.
   */
  @Column({ type: 'numeric', precision: 14, scale: 2 })
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
    asExpression: 'cantidad::numeric * precio_unitario',
    generatedType: 'STORED',
  })
  subtotal!: string | null;

  /*
   * Estado del registro.
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
   * Usuario que creó el registro.
   */
  @Column({ type: 'uuid', name: '_user_created' })
  _user_created!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'idUsuario',
  })
  usuarioCreador!: Usuario;

  /*
   * Usuario que actualizó el registro.
   */
  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  _user_update!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'idUsuario',
  })
  usuarioActualizador!: Usuario | null;

  /*
   * Usuario que realizó la baja lógica.
   */
  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  _user_delete!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'idUsuario',
  })
  usuarioEliminador!: Usuario | null;
}
