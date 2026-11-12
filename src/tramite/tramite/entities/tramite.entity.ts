/**
 * Módulo: Trámites - Expediente Central
 * Archivo: tramite.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Tramite,
 * correspondiente a la tabla tramite del esquema tramite.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { PersonaNatural } from 'src/catalogo/persona-natural/entities/persona-natural.entity';
import { PersonaJuridica } from 'src/catalogo/persona-juridica/entities/persona-juridica.entity';

import { Liquidacion } from 'src/tramite-vut/liquidacion/entities/liquidacion.entity';

import { ArancelDetalle } from 'src/arancel/arancel-detalle/entities/arancel-detalle.entity';
import { TipoTramiteCatalogo } from 'src/arancel/tipo-tramite-catalogo/entities/tipo-tramite-catalogo.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

/**
 * Entidad Tramite.
 * Representa el expediente central del sistema.
 *
 * Une clasificación, solicitante, numeración anual,
 * estado, usuario creador y procesos derivados.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

@Entity({ schema: 'tramite', name: 'tramite' })
@Unique('tramite_gestion_correlativo_key', ['gestion', 'correlativo'])
@Unique('tramite_nro_tramite_key', ['nro_tramite'])
@Unique('uq_tramite_id_tipo', ['id', 'tipo_tramite_id'])
export class Tramite {
  /*
   * Identificador único del trámite.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /*
   * Número anual del trámite.
   * Generado automáticamente mediante trigger.
   */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'nro_tramite',
  })
  nro_tramite!: string;

  /*
   * Gestión administrativa del trámite.
   */
  @Column({
    type: 'smallint',
    name: 'gestion',
  })
  gestion!: number;

  /*
   * Número correlativo dentro de la gestión.
   * Generado automáticamente mediante trigger.
   */
  @Column({
    type: 'integer',
    name: 'correlativo',
  })
  correlativo!: number;

  /*
   * Identificador del tipo de trámite.
   */
  @Column({
    type: 'uuid',
    name: 'id_tipo_tramite',
  })
  tipo_tramite_id!: string;

  /*
   * Relación con el catálogo de tipos de trámite.
   */
  @ManyToOne(() => TipoTramiteCatalogo, {
    nullable: false,
  })
  @JoinColumn({
    name: 'id_tipo_tramite',
    referencedColumnName: 'id_tipo_tramite',
  })
  tipo_tramite!: TipoTramiteCatalogo;

  /*
   * Identificador del detalle arancelario.
   */
  @Column({
    type: 'uuid',
    name: 'id_arancel_det',
    nullable: true,
  })
  arancel_det_id!: string | null;

  /*
   * Relación con el detalle arancelario.
   *
   * FK compuesta:
   * id_arancel_det + id_tipo_tramite.
   */
  @ManyToOne(() => ArancelDetalle, {
    nullable: true,
  })
  @JoinColumn([
    {
      name: 'id_arancel_det',
      referencedColumnName: 'id_arancel_det',
    },
    {
      name: 'id_tipo_tramite',
      referencedColumnName: 'id_tipo_tramite',
    },
  ])
  arancel_det!: ArancelDetalle | null;

  /*
   * Identificador del solicitante persona natural.
   */
  @Column({
    type: 'uuid',
    name: 'id_solicitante_natural',
    nullable: true,
  })
  solicitante_natural_id!: string | null;

  /*
   * Relación con la persona natural solicitante.
   */
  @ManyToOne(() => PersonaNatural, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_solicitante_natural',
    referencedColumnName: 'id_persona_natural',
  })
  solicitante_natural!: PersonaNatural | null;

  /*
   * Identificador del solicitante persona jurídica.
   */
  @Column({
    type: 'uuid',
    name: 'id_solicitante_juridica',
    nullable: true,
  })
  solicitante_juridica_id!: string | null;

  /*
   * Relación con la persona jurídica solicitante.
   */
  @ManyToOne(() => PersonaJuridica, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_solicitante_juridica',
    referencedColumnName: 'id_persona_juridica',
  })
  solicitante_juridica!: PersonaJuridica | null;

  /*
   * Código de identificación del solicitante.
   */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'cod_ci',
    nullable: true,
  })
  cod_ci!: string | null;

  /*
   * Nombre o razón social del solicitante.
   */
  @Column({
    type: 'varchar',
    length: 250,
    name: 'nombre_solicitante',
  })
  nombre_solicitante!: string;

  /*
   * Dirección del solicitante o del bien.
   */
  @Column({
    type: 'varchar',
    length: 250,
    name: 'direccion',
    nullable: true,
  })
  direccion!: string | null;

  /*
   * Número telefónico del solicitante.
   */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'telefono',
    nullable: true,
  })
  telefono!: string | null;

  /*
   * Estado funcional del trámite.
   * Se conserva como string, sin enum de TypeScript.
   */
  @Column({
    type: 'enum',
    enumName: 'estado_tramite',
    name: 'estado_tramite',
    default: 'REGISTRADO',
  })
  estado_tramite!: string;

  /*
   * Fecha y hora de ingreso del trámite.
   */
  @Column({
    type: 'timestamptz',
    name: 'fecha_ingreso',
    default: () => 'now()',
  })
  fecha_ingreso!: Date;

  /*
   * Fecha y hora de cierre del trámite.
   */
  @Column({
    type: 'timestamptz',
    name: 'fecha_cierre',
    nullable: true,
  })
  fecha_cierre!: Date | null;

  /*
   * Observaciones generales del trámite.
   */
  @Column({
    type: 'text',
    name: 'observaciones',
    nullable: true,
  })
  observaciones!: string | null;

  /*
   * Identificador del trámite padre.
   */
  @Column({
    type: 'uuid',
    name: 'id_tramite_padre',
    nullable: true,
  })
  tramite_padre_id!: string | null;

  /*
   * Relación con el trámite padre.
   */
  @ManyToOne(() => Tramite, (tramite) => tramite.tramites_derivados, {
    nullable: true,
  })
  @JoinColumn({
    name: 'id_tramite_padre',
    referencedColumnName: 'id_tramite',
  })
  tramite_padre!: Tramite | null;

  /*
   * Trámites derivados de este expediente.
   */
  @OneToMany(() => Tramite, (tramite) => tramite.tramite_padre)
  tramites_derivados!: Tramite[];

  /*
   * Estado del registro: ACTIVO / INACTIVO.
   */
  @Column({
    type: 'varchar',
    name: 'estado',
    default: 'ACTIVO',
  })
  estado!: string;

  /*
   * Fecha y hora de creación.
   * Administrada por trigger.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt!: Date;

  /*
   * Fecha y hora de última actualización.
   * Administrada por trigger.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt!: Date;

  /*
   * Fecha y hora de eliminación lógica.
   */
  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  deletedAt!: Date | null;

  /*
   * Identificador del usuario creador.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  usuario_creador_id!: string;

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
  usuario_actualizador_id!: string | null;

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
  usuario_eliminador_id!: string | null;

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

  /*
   * Liquidaciones asociadas al trámite.
   */
  @OneToMany(() => Liquidacion, (liquidacion) => liquidacion.tramite)
  liquidaciones!: Liquidacion[];
}
