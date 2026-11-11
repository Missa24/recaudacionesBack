/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: persona-juridica.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad PersonaJuridica,
 * correspondiente a la tabla persona_juridica del esquema catalogo.
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
 * Entidad PersonaJuridica.
 * Representa la información tributaria, comercial y de auditoría
 * de las personas jurídicas registradas en el sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Entity({ schema: 'catalogo', name: 'persona_juridica' })
@Unique('uq_persona_juridica_nit', ['nit'])
export class PersonaJuridica {
  /**
   * Identificador único de la persona jurídica.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /**
   * Número de identificación tributaria.
   */
  @Column({ type: 'varchar', length: 30 })
  nit!: string;

  /**
   * Razón social de la persona jurídica.
   */
  @Column({ type: 'varchar', length: 250 })
  razon_social!: string;

  /**
   * Domicilio de la persona jurídica.
   */
  @Column({ type: 'varchar', length: 250, nullable: true })
  domicilio!: string | null;

  /**
   * Número de teléfono de contacto.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  /**
   * Correo electrónico de contacto.
   */
  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  /**
   * Estado actual del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'varchar',
    default: 'ACTIVO',
  })
  estado!: string;

  /**
   * Fecha y hora de creación del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _created_at!: Date;

  /**
   * Fecha y hora de la última actualización del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _updated_at!: Date;

  /**
   * Fecha y hora de inactivación lógica del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  _deleted_at!: Date | null;

  /**
   * Identificador del usuario que creó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  _user_created!: string;

  /**
   * Relación con el usuario responsable de la creación.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'idUsuario',
  })
  usuario_creador!: Usuario;

  /**
   * Identificador del usuario que actualizó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  _user_update!: string | null;

  /**
   * Relación con el usuario responsable de la actualización.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'idUsuario',
  })
  usuario_actualizador!: Usuario | null;

  /**
   * Identificador del usuario que inactivó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /**
   * Relación con el usuario responsable de la inactivación.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'idUsuario',
  })
  usuario_eliminador!: Usuario | null;
}
