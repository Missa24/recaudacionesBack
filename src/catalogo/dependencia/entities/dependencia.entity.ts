/**
 * Módulo: Catálogos - Dependencia
 * Archivo: dependencia.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Dependencia,
 * correspondiente a la tabla dependencia del esquema catalogo.
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
 * Entidad Dependencia.
 * Catálogo compartido de oficinas y unidades
 * ejecutoras o receptoras de derivaciones.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

@Entity({ schema: 'catalogo', name: 'dependencia' })
@Unique('codigo_dependencia', ['codigo'])
export class Dependencia {
  // Idenficador único del registro del calendario.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Código funcional único dentro de este catálogo.
  @Column({ type: 'text' })
  codigo!: string;

  // Nombre descriptivo del catálogo.
  @Column({ type: 'text' })
  nombre!: string;

  // Forma corta del nombre de la dependencia.
  @Column({ type: 'text', nullable: true })
  abreviacion!: string;

  // Indica si la dependencia es una unidad desconcentrada.
  @Column({ type: 'boolean', default: false })
  es_unidad_desconcentrada!: boolean;

  // Estado actual del registro.
  @Column({
    type: 'text',
    default: 'ACTIVO',
  })
  estado!: string;

  /**
   * Fecha de creación del registro.
   * Se genera automáticamente mediante el valor por defecto de la base de datos.
   */
  @Column({
    name: '_created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _created_at!: Date;

  /**
   * Fecha de la última actualización del registro.
   * Se administra desde la lógica del servicio.
   */
  @Column({
    name: '_updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  _updated_at!: Date | null;

  /**
   * Fecha en la que el registro fue dado de baja.
   * Se administra desde la lógica del servicio.
   */
  @Column({
    name: '_deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  _deleted_at!: Date | null;

  // Identificador del usuario que creó el registro.
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  _user_created!: string;

  /**
   * Relación con el usuario responsable de la creación.
   * No permite eliminar usuarios que tengan registros asociados.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'idUsuario',
  })
  usuario_creador!: Usuario;

  // Identificador del usuario que realizó la última actualización.
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

  // Identificador del usuario que realizó la eliminación lógica.
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /**
   * Relación con el usuario responsable de la eliminación lógica.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'idUsuario',
  })
  usuario_eliminador!: Usuario | null;
}
