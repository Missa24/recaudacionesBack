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
import { CotizacionDetalle } from 'src/tramite-vut/cotizacion-detalle/entities/cotizacion-detalle.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';

/**
 * Entidad Cotizacion.
 * Representa la cabecera del presupuesto de un trámite.
 *
 * Los ítems comerciales se encuentran normalizados
 * en la entidad CotizacionDetalle.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'cotizacion' })
@Unique('cotizacion_nro_cotizacion_key', ['nro_cotizacion'])
@Check('cotizacion_monto_cotizado_check', '"monto_cotizado" >= 0::numeric')
export class Cotizacion {
  /*
   * Identificador único de la cotización.
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
  id_tramite!: string;

  /*
   * Relación con el expediente.
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
   * Número externo único de cotización.
   * Asignado por la aplicación.
   */
  @Column({
    type: 'varchar',
    length: 20,
  })
  nro_cotizacion!: string;

  /*
   * Fecha y hora de generación de la cotización.
   */
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  fecha_cotizacion!: Date;

  /*
   * Monto total cotizado.
   * Debe coincidir con la suma de los subtotales
   * de los detalles al confirmar la transacción.
   */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  monto_cotizado!: string;

  /*
   * Información auxiliar en formato JSONB.
   * No contiene los ítems comerciales.
   */
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, any> | null;

  /*
   * Fecha de vencimiento de la cotización.
   */
  @Column({
    type: 'date',
    nullable: true,
  })
  valida_hasta!: string | null;

  /*
   * Relación inversa con los detalles de cotización.
   */
  @OneToMany(() => CotizacionDetalle, (detalle) => detalle.cotizacion)
  detalles!: CotizacionDetalle[];

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
  _user_delete!: string | null;

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
}
