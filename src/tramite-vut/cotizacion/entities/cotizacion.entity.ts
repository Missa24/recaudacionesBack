/**
 * Módulo: Trámites - Cotización
 * Archivo: cotizacion.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Cotizacion,
 * correspondiente a la tabla cotizacion del esquema tramite.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';
import { CotizacionDetalle } from 'src/tramite-vut/cotizacion_detalle/entities/cotizacion_detalle.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity({ schema: 'tramite', name: 'cotizacion' })
export class Cotizacion {
  /*
   * Identificador único de la cotización.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id_cotizacion' })
  id_cotizacion!: string;

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
   * Número único de cotización.
   */
  @Column({ type: 'varchar', length: 20, unique: true })
  nro_cotizacion!: string;

  /*
   * Fecha de generación de la cotización.
   */
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  fecha_cotizacion!: Date;

  /*
   * Monto total cotizado.
   */
  @Column({ type: 'numeric', precision: 14, scale: 2 })
  monto_cotizado!: string;

  /*
   * Información auxiliar en formato JSON.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  /*
   * Fecha de vencimiento de la cotización.
   */
  @Column({ type: 'date', nullable: true })
  valida_hasta!: string | null;

  /*
   * Relación inversa con los detalles de cotización.
   * No genera una columna adicional en PostgreSQL.
   */
  @OneToMany(() => CotizacionDetalle, (detalle) => detalle.cotizacion)
  detalles!: CotizacionDetalle[];

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
