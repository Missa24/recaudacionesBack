/**
 * Módulo: Trámites - Expediente Central
 * Archivo: correlativo-anual.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad CorrelativoAnual,
 * correspondiente a la tabla correlativo_anual del esquema tramite.
 *
 * Administra el contador interno anual utilizado bajo bloqueo
 * por el trigger de numeración de los trámites.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity({ schema: 'tramite_vut', name: 'correlativo_anual' })
@Unique('correlativo_anual_gestion_key', ['gestion'])
export class CorrelativoAnual {
  /*
   * Identificador único del contador anual.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /*
   * Gestión administrativa.
   * Identifica el año del contador anual.
   */
  @Column({
    type: 'smallint',
    name: 'gestion',
  })
  gestion!: number;

  /*
   * Último correlativo anual asignado.
   * Administrado por el trigger de numeración.
   */
  @Column({
    type: 'integer',
    name: 'ultimo_valor',
  })
  ultimo_valor!: number;

  /*
   * Estado del registro: ACTIVO / INACTIVO.
   * Independiente del estado funcional del trámite.
   */
  @Column({
    type: 'varchar',
    name: 'estado',
    default: 'ACTIVO',
  })
  estado!: string;

  /*
   * Fecha y hora de creación.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt!: Date;

  /*
   * Fecha y hora de última actualización.
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
   * Identificador del usuario que creó el registro.
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
   * Identificador del usuario que actualizó el registro.
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
