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

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ArancelDetalle } from 'src/arancel/arancel-detalle/entities/arancel-detalle.entity';
import { TipoTramiteCatalogo } from 'src/arancel/tipo-tramite-catalogo/entities/tipo-tramite-catalogo.entity';

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
@Unique('uq_tramite_id_tipo', ['id_tramite', 'id_tipo_tramite'])
export class Tramite {
  /*
   * Identificador único del trámite.
   * UUID generado automáticamente por PostgreSQL.
   */
  @PrimaryGeneratedColumn('uuid')
  id_tramite!: string;

  /*
   * Número anual del trámite.
   * Generado automáticamente mediante trigger.
   */
  @Column({
    type: 'varchar',
    length: 20,
  })
  nro_tramite!: string;

  /*
   * Gestión administrativa del trámite.
   */
  @Column({
    type: 'smallint',
  })
  gestion!: number;

  /*
   * Número correlativo dentro de la gestión.
   */
  @Column({
    type: 'integer',
  })
  correlativo!: number;

  /*
   * Identificador del tipo de trámite.
   */
  @Column({
    type: 'uuid',
    name: 'tipo_tramite_id',
  })
  id_tipo_tramite!: string;

  /*
   * Relación con el catálogo de tipos de trámite.
   */
  @ManyToOne(() => TipoTramiteCatalogo, { nullable: false })
  @JoinColumn({
    name: 'tipo_tramite_id',
    referencedColumnName: 'id_tipo_tramite',
  })
  tipo_tramite!: TipoTramiteCatalogo;

  /*
   * Identificador del detalle arancelario.
   */
  @Column({
    type: 'uuid',
    name: 'arancel_det_id',
    nullable: true,
  })
  id_arancel_det!: string | null;

  /*
   * Relación con el detalle arancelario.
   */
  @ManyToOne(() => ArancelDetalle, { nullable: true })
  @JoinColumn({
    name: 'arancel_det_id',
    referencedColumnName: 'id_arancel_det',
  })
  arancel_det!: ArancelDetalle | null;

  /*
   * Identificador del solicitante persona natural.
   */
  @Column({
    type: 'uuid',
    name: 'solicitante_natural_id',
    nullable: true,
  })
  id_solicitante_natural!: string | null;

  /*
   * Relación con la persona natural solicitante.
   */
  @ManyToOne(() => PersonaNatural, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'solicitante_natural_id',
    referencedColumnName: 'id_persona_natural',
  })
  solicitante_natural!: PersonaNatural | null;

  /*
   * Identificador del solicitante persona jurídica.
   */
  @Column({
    type: 'uuid',
    name: 'solicitante_juridica_id',
    nullable: true,
  })
  id_solicitante_juridica!: string | null;

  /*
   * Relación con la persona jurídica solicitante.
   */
  @ManyToOne(() => PersonaJuridica, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'solicitante_juridica_id',
    referencedColumnName: 'id_persona_juridica',
  })
  solicitante_juridica!: PersonaJuridica | null;

  /*
   * Código de identificación del solicitante.
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cod_ci!: string | null;

  /*
   * Nombre o razón social del solicitante.
   */
  @Column({
    type: 'varchar',
    length: 250,
  })
  nombre_solicitante!: string;

  /*
   * Dirección del solicitante o del bien.
   */
  @Column({
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  direccion!: string | null;

  /*
   * Número telefónico del solicitante.
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono!: string | null;

  /*
   * Estado funcional del trámite.
   */
  @Column({
    type: 'varchar',
    length: 30,
  })
  estado_tramite!: string;

  /*
   * Fecha y hora de ingreso del trámite.
   */
  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  fecha_ingreso!: Date;

  /*
   * Fecha y hora de cierre del trámite.
   */
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  fecha_cierre!: Date | null;

  /*
   * Observaciones generales del trámite.
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones!: string | null;

  /*
   * Identificador del trámite padre.
   */
  @Column({
    type: 'uuid',
    name: 'tramite_padre_id',
    nullable: true,
  })
  id_tramite_padre!: string | null;

  /*
   * Relación con el trámite padre.
   */
  @ManyToOne(() => Tramite, {
    nullable: true,
  })
  @JoinColumn({
    name: 'tramite_padre_id',
    referencedColumnName: 'id_tramite',
  })
  tramite_padre!: Tramite | null;

  /*
   * Trámites derivados de este expediente.
   */
  @OneToMany(() => Tramite, (tramite) => tramite.tramite_padre)
  tramites_derivados!: Tramite[];

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
    referencedColumnName: 'idUsuario',
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

  /*
   * Liquidaciones asociadas al trámite.
   */
  @OneToMany(() => Liquidacion, (liquidacion) => liquidacion.tramite)
  liquidaciones!: Liquidacion[];
}
