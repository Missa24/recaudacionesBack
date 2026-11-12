/**
 * Módulo: Trámites VUT - Requisitos Entregados
 * Archivo: requisito-entregado.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad RequisitoEntregado,
 * correspondiente a la tabla requisito_entregado del esquema tramite_vut.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Requisito } from 'src/catalogo/requisito/entities/requisito.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';

/**
 * Entidad RequisitoEntregado.
 * Representa el cumplimiento documental de un requisito
 * asignado a un expediente.
 *
 * Las relaciones compuestas garantizan que el requisito
 * corresponda al mismo tipo de trámite del expediente.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite_vut', name: 'requisito_entregado' })
@Unique('requisito_entregado_tramite_id_requisito_id_key', [
  'tramite_id',
  'requisito_id',
])
@Check(
  'requisito_entregado_check',
  '("verificado_por" IS NULL) = ("fecha_verificacion" IS NULL)',
)
export class RequisitoEntregado {
  // Identificador único

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Claves foráneas

  @Column({ type: 'uuid', name: 'tramite_id' })
  tramite_id!: string;

  @Column({ type: 'uuid', name: 'requisito_id' })
  requisito_id!: string;

  @Column({ type: 'uuid', name: 'tipo_tramite_id' })
  tipo_tramite_id!: string;

  @Column({ type: 'uuid', name: 'verificado_por', nullable: true })
  verificado_por!: string | null;

  @Column({ type: 'uuid', name: '_user_created' })
  usuarios_created_id!: string;

  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  usuarios_update_id!: string | null;

  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  usuarios_delete_id!: string | null;

  // Relaciones principales

  /*
   * Relación con trámite mediante FK compuesta.
   * tramite_id + tipo_tramite_id.
   */
  @ManyToOne(() => Tramite, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'tramite_id',
      referencedColumnName: 'id',
    },
    {
      name: 'tipo_tramite_id',
      referencedColumnName: 'tipo_tramite_id',
    },
  ])
  tramite!: Tramite;

  /*
   * Relación con requisito mediante FK compuesta.
   * requisito_id + tipo_tramite_id.
   */
  @ManyToOne(() => Requisito, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'requisito_id',
      referencedColumnName: 'id',
    },
    {
      name: 'tipo_tramite_id',
      referencedColumnName: 'tipo_tramite_id',
    },
  ])
  requisito!: Requisito;

  /*
   * Relación con el usuario verificador.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'verificado_por',
    referencedColumnName: 'id',
  })
  usuarioVerificador!: Usuario | null;

  // Datos del requisito entregado

  @Column({
    type: 'boolean',
    default: false,
  })
  entregado!: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  observacion!: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  fecha_verificacion!: Date | null;

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
  _created_at!: Date;

  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  _updated_at!: Date;

  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  _deleted_at!: Date | null;

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
