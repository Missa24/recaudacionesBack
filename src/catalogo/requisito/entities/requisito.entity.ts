/**
 * Módulo: Catálogos - Requisitos
 * Archivo: requisito.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad Requisito,
 * correspondiente a la tabla requisito del esquema catalogo.
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
 * Entidad Requisito.
 * Representa el catálogo documental compartido por los módulos
 * de Trámites y Tributaria.
 *
 * Cada requisito contiene un código único, una descripción
 * y un estado de registro.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Entity({ schema: 'catalogo', name: 'requisito' })
@Unique('requisito_codigo_key', ['codigo'])
export class Requisito {
  /*
   * Identificador único del requisito.
   * UUID generado automáticamente por la base de datos.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id_requisito' })
  id_requisito!: string;

  /*
   * Código único de identificación del requisito.
   */
  @Column({
    type: 'varchar',
    length: 50,
  })
  codigo!: string;

  /*
   * Descripción del documento requerido.
   */
  @Column({
    type: 'varchar',
    length: 300,
  })
  descripcion!: string;

  /*
   * Estado actual del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'varchar',
    default: 'ACTIVO',
  })
  estado!: string;

  /*
   * Fecha y hora de creación del registro.
   * Administrado por el trigger de la base de datos.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'clock_timestamp()',
  })
  _created_at!: Date;

  /*
   * Fecha y hora de la última actualización del registro.
   * Administrado por el trigger de la base de datos.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'clock_timestamp()',
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
   * Identificador del usuario que realizó la baja lógica.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /*
   * Relación con el usuario responsable de la baja lógica.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'idUsuario',
  })
  usuario_eliminador!: Usuario | null;
}
