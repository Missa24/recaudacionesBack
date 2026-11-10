/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: persona-natural.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad PersonaNatural,
 * correspondiente a la tabla persona_natural del esquema catalogo.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

/**
 * Entidad PersonaNatural.
 * Representa la información personal, documental y de auditoría
 * de las personas naturales registradas en el sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Entity({ schema: 'catalogo', name: 'persona_natural' })
@Unique('uq_persona_natural_documento', [
  'tipo_documento',
  'numero_documento',
  'complemento',
  'expedido',
])
export class PersonaNatural {
  /*
   * Identificador único de la persona natural.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /*
   * Tipo de documento de identidad.
   */
  @Column({ type: 'varchar', length: 20 })
  tipo_documento!: string;

  /*
   * Número del documento de identidad.
   */
  @Column({ type: 'varchar', length: 30 })
  numero_documento!: string;

  /*
   * Complemento del documento de identidad.
   */
  @Column({ type: 'varchar', length: 10, default: '' })
  complemento!: string;

  /*
   * Lugar de expedición del documento de identidad.
   */
  @Column({ type: 'varchar', length: 10, default: '' })
  expedido!: string;

  /*
   * Nombres de la persona natural.
   */
  @Column({ type: 'varchar', length: 150 })
  nombres!: string;

  /*
   * Apellido paterno de la persona natural.
   */
  @Column({ type: 'varchar', length: 150, nullable: true })
  apellido_paterno!: string | null;

  /*
   * Apellido materno de la persona natural.
   */
  @Column({ type: 'varchar', length: 150, nullable: true })
  apellido_materno!: string | null;

  /*
   * Domicilio de la persona natural.
   */
  @Column({ type: 'varchar', length: 250, nullable: true })
  domicilio!: string | null;

  /*
   * Número de teléfono de contacto.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  /*
   * Correo electrónico de la persona natural.
   */
  @Column({ type: 'citext', nullable: true })
  email!: string | null;

  /*
   * Fecha de nacimiento de la persona natural.
   */
  @Column({ type: 'date', nullable: true })
  fecha_nacimiento!: string | null;

  /*
   * Apellido de casada, cuando corresponda.
   */
  @Column({ type: 'varchar', length: 150, nullable: true })
  apellido_casada!: string | null;

  /*
   * Estado civil de la persona natural.
   */
  @Column({
    type: 'enum',
    enum: ['NO DECLARADO'],
    enumName: 'estado_civil',
    default: 'NO DECLARADO',
  })
  estado_civil!: string;

  /*
   * Estado actual del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    enumName: 'estado_registro',
    default: 'ACTIVO',
  })
  estado!: string;

  /*
   * Fecha y hora de creación del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _created_at!: Date;

  /*
   * Fecha y hora de la última actualización del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _updated_at!: Date;

  /*
   * Fecha y hora de eliminación lógica del registro.
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
   * Relación con el usuario responsable de la creación.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'idUsuario',
  })
  usuario_creador!: Usuario;

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
   * Relación con el usuario responsable de la actualización.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'idUsuario',
  })
  usuario_actualizador!: Usuario | null;

  /*
   * Identificador del usuario que inactivó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /*
   * Relación con el usuario responsable de la inactivación.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'idUsuario',
  })
  usuario_eliminador!: Usuario | null;
}
