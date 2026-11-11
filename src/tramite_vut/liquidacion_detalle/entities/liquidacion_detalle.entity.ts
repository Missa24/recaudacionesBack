import { ArancelDetalle } from 'src/arancel/arancel-detalle/entities/arancel-detalle.entity';
import { Tarifa } from 'src/arancel/tarifa/entities/tarifa.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Liquidacion } from 'src/tramite_vut/liquidacion/entities/liquidacion.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Módulo: Trámite - Liquidación
 * Archivo: liquidacion_detalle.entity.ts
 * Descripción:
 * Define los detalles de una liquidación.
 */
@Entity({ schema: 'tramite', name: 'liquidacion_detalle' })
export class LiquidacionDetalle {
  @PrimaryGeneratedColumn('uuid', { name: 'id_detalle' })
  id_detalle!: string;

  // Claves foráneas
  @Column({ type: 'uuid', name: 'id_liquidacion' })
  id_liquidacion!: string;

  @Column({ type: 'uuid', name: 'id_arancel_det' })
  id_arancel_det!: string;

  @Column({ type: 'uuid', name: 'id_tarifa' })
  id_tarifa!: string;

  @Column({ type: 'uuid', name: '_user_created' })
  usuarios_created_id!: string;

  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  usuarios_update_id!: string | null;

  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  usuarios_delete_id!: string | null;

  // Relación con Liquidación
  @ManyToOne(() => Liquidacion, (liquidacion) => liquidacion.detalles)
  @JoinColumn({
    name: 'id_liquidacion',
    referencedColumnName: 'id_liquidacion',
  })
  liquidacion!: Liquidacion;

  // Relación con Arancel
  @ManyToOne(() => ArancelDetalle)
  @JoinColumn({
    name: 'id_arancel_det',
    referencedColumnName: 'id_arancel_det',
  })
  arancelDet!: ArancelDetalle;

  // Relación compuesta con Tarifa
  @ManyToOne(() => Tarifa)
  @JoinColumn([
    { name: 'id_tarifa', referencedColumnName: 'id_tarifa' },
    { name: 'id_arancel_det', referencedColumnName: 'id_arancel_det' },
  ])
  tarifa!: Tarifa;

  // Relación con usuarios
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: '_user_created', referencedColumnName: 'idUsuario' })
  usuarioCreador!: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: '_user_update', referencedColumnName: 'idUsuario' })
  usuarioActualizador!: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: '_user_delete', referencedColumnName: 'idUsuario' })
  usuarioEliminador!: Usuario | null;

  // Datos del detalle
  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  precio_unitario!: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
    insert: false,
    update: false,
    asExpression: 'cantidad * precio_unitario',
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

  // Estado y auditoría
  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  _created_at!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  _updated_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  _deleted_at!: Date | null;
}
