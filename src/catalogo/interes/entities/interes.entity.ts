/**
 * Módulo: Catálogo - Interes
 * Archivo: interes.entity.ts
 * Descripción:
 * Define la entidad Entidad correspondiente a la tabla catalogo.interes.
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
 * Entidad: Interes
 * Descripción:
 * Representa los registros de valores Interes almacenados en la base de datos,
 * con control de estados y campos de auditoría.
 *
 * Desarrollado por: Missael Apaza
 */

@Entity({ schema: 'catalogo', name: 'interes' })
@Unique('UQ_interes_fecha', ['fecha_publicacion'])
export class Interes {
  // Identificador único del registro Interes.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Fecha a la que se publica el interés.
  @Column({ type: 'date' })
  fecha_publicacion!: string;

  // Valor de interés con precision de 8 digitos a 4 decimales-
  @Column({ type: 'numeric', precision: 8, scale: 4 })
  valor!: number;
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
    name: '_updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  _updated_at!: Date | null;

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
