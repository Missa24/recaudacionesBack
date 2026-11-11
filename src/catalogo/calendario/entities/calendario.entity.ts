/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Calendario,
 * correspondiente a la tabla calendario del esquema catalogo.
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
 * Entidad Calendario.
 * Representa la configuración de días hábiles y no hábiles
 * del calendario institucional.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Entity({ schema: 'catalogo', name: 'calendario' })
@Unique('calendario_fecha_key', ['fecha'])
export class Calendario {
  /**
   * Identificador único del registro del calendario.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /**
   * Fecha configurada en el calendario.
   */
  @Column({ type: 'date' })
  fecha!: string;

  /**
   * Indica si la fecha corresponde a un día hábil.
   */
  @Column({ type: 'boolean', default: true })
  dia_habil!: boolean;

  /**
   * Descripción o motivo de la configuración del día.
   */
  @Column({ type: 'varchar', length: 120, nullable: true })
  descripcion!: string | null;

  /**
   * Estado actual del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'text',
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
