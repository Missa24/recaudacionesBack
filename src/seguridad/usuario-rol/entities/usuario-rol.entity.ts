import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';
import { Rol } from '../../rol/entities/rol.entity';

/**
 * Módulo: Seguridad / UsuarioRol
 * Archivo: usuario-rol.entity.ts
 *
 * Descripción:
 * Representa la tabla seguridad.usuario_rol.
 * Asigna roles a los usuarios del sistema.
 */
@Entity({ schema: 'seguridad', name: 'usuario_rol' })
@Unique('UQ_usuario_rol_usuario_rol', ['usuario_id', 'rol_id'])
export class UsuarioRol {
  /** Identificador UUID de la asignación. */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /** UUID del usuario asignado. */
  @Column({
    name: 'usuario_id',
    type: 'uuid',
    nullable: false,
  })
  usuario_id!: string;

  /** Relación con el usuario asignado. */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'usuario_id',
    referencedColumnName: 'id',
  })
  usuario!: Usuario;

  /** UUID del rol asignado. */
  @Column({
    name: 'rol_id',
    type: 'uuid',
    nullable: false,
  })
  rol_id!: string;

  /** Relación con el rol asignado. */
  @ManyToOne(() => Rol, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'rol_id',
    referencedColumnName: 'id',
  })
  rol!: Rol;

  /** Estado de la asignación. */
  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    default: 'ACTIVO',
    nullable: false,
  })
  estado!: string;

  /** Fecha de creación. */
  @CreateDateColumn({
    name: '_created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  /** Fecha de actualización. */
  @UpdateDateColumn({
    name: '_updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  /** Fecha de eliminación lógica. */
  @Column({
    name: '_deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;

  /** UUID del usuario que creó la asignación. */
  @Column({
    name: '_user_created',
    type: 'uuid',
    nullable: false,
  })
  _user_created!: string;

  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'id',
  })
  usuario_creador!: Usuario;

  /** UUID del usuario que actualizó la asignación. */
  @Column({
    name: '_user_update',
    type: 'uuid',
    nullable: true,
  })
  _user_update!: string | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'id',
  })
  usuario_actualizador!: Usuario | null;

  /** UUID del usuario que eliminó la asignación. */
  @Column({
    name: '_user_delete',
    type: 'uuid',
    nullable: true,
  })
  _user_delete!: string | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'id',
  })
  usuario_eliminador!: Usuario | null;
}
