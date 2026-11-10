/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv.entity.ts
 * Descripción:
 * Define la entidad UFV correspondiente a la tabla catalogo.ufv.
 * Establece sus campos, restricciones de unicidad y relaciones
 * con los usuarios responsables de su creación, actualización y eliminación.
 *
 * Desarrollado por: Missael Apaza
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
 * Entidad: Ufv
 * Descripción:
 * Representa los registros de valores UFV almacenados en la base de datos,
 * con control de estados y campos de auditoría.
 *
 * Desarrollado por: Missael Apaza
 */
@Entity({ schema: 'catalogo', name: 'ufv' })
@Unique('UQ_ufv_fecha', ['fecha'])
export class Ufv {
  // Identificador único del registro UFV.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Fecha a la que corresponde el valor UFV.
  @Column({ type: 'date' })
  fecha!: string;

  // Valor UFV con precisión de 12 dígitos y 6 decimales.
  @Column({ type: 'numeric', precision: 12, scale: 6 })
  valor!: number;

  // Estado actual del registro.
  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    enumName: 'estado_registro',
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
