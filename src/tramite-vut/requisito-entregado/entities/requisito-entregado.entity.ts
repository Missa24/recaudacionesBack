/**
 * Módulo: Trámites VUT - Requisitos Entregados
 * Archivo: requisito-entregado.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad RequisitoEntregado,
 * correspondiente a la tabla requisito_entregado del esquema tramite.
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
} from 'typeorm';

/**
 * Entidad RequisitoEntregado.
 * Representa el cumplimiento documental de un requisito
 * asignado a un expediente.
 *
 * Las relaciones compuestas garantizan que el requisito
 * pertenezca al mismo tipo de trámite del expediente.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite-vut', name: 'requisito_entregado' })
@Unique('requisito_entregado_id_tramite_id_requisito_key', [
  'id_tramite',
  'id_requisito',
])
export class RequisitoEntregado {
  /*
   * Identificador único del requisito entregado.
   */
  @PrimaryGeneratedColumn('uuid')
  id_requisito_entregado!: string;

  /*
   * Identificador del trámite asociado.
   */
  @Column({
    type: 'uuid',
    name: 'tramite_id',
  })
  id_tramite!: string;

  /*
   * Identificador del requisito asignado al tipo de trámite.
   */
  @Column({
    type: 'uuid',
    name: 'requisito_id',
  })
  id_requisito!: string;

  /*
   * Identificador del tipo de trámite.
   * Campo técnico utilizado para las FK compuestas.
   */
  @Column({
    type: 'uuid',
    name: 'tipo_tramite_id',
  })
  id_tipo_tramite!: string;

  /*
   * Relación con el expediente.
   *
   * FK compuesta:
   * tramite_id + tipo_tramite_id.
   */
  @ManyToOne(() => Tramite, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'tramite_id',
      referencedColumnName: 'id_tramite',
    },
    {
      name: 'tipo_tramite_id',
      referencedColumnName: 'id_tipo_tramite',
    },
  ])
  tramite!: Tramite;

  /*
   * Relación con el requisito asignado.
   *
   * FK compuesta:
   * requisito_id + tipo_tramite_id.
   */
  @ManyToOne(() => Requisito, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'requisito_id',
      referencedColumnName: 'id_requisito',
    },
    {
      name: 'tipo_tramite_id',
      referencedColumnName: 'id_tipo_tramite',
    },
  ])
  requisito!: Requisito;

  /*
   * Indica si el requisito fue presentado.
   */
  @Column({
    type: 'boolean',
    default: false,
  })
  entregado!: boolean;

  /*
   * Observaciones del requisito entregado.
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  observacion!: string | null;

  /*
   * Identificador del usuario que verificó el requisito.
   */
  @Column({
    type: 'uuid',
    name: 'verificado_por',
    nullable: true,
  })
  verificado_por!: string | null;

  /*
   * Relación con el usuario verificador.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'verificado_por',
    referencedColumnName: 'idUsuario',
  })
  usuarioVerificador!: Usuario | null;

  /*
   * Fecha y hora de verificación del requisito.
   */
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  fecha_verificacion!: Date | null;

  /*
   * Estado del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'varchar',
    length: 20,
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
  _created_at!: Date;

  /*
   * Fecha y hora de última actualización.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  _updated_at!: Date;

  /*
   * Fecha y hora de eliminación lógica.
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
