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
import { Modulo } from '../../modulo/entities/modulo.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';

/**
 * Módulo: Seguridad / RolModuloPermiso
 * Archivo: rol-modulo-permiso.entity.ts
 *
 * Descripción:
 * Representa la tabla seguridad.rol_modulo_permiso.
 * Relaciona roles, módulos y permisos para definir
 * las acciones autorizadas dentro del sistema.
 */
@Entity({
  schema: 'seguridad',
  name: 'rol_modulo_permiso',
})
@Unique('UQ_rol_modulo_permiso_combinacion', [
  'rol_id',
  'modulo_id',
  'permiso_id',
])
export class RolModuloPermiso {
  /** Identificador UUID de la asignación. */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /** UUID del rol. */
  @Column({
    name: 'rol_id',
    type: 'uuid',
    nullable: false,
  })
  rol_id!: string;

  /** Relación con el rol. */
  @ManyToOne(() => Rol, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'rol_id',
    referencedColumnName: 'id',
  })
  rol!: Rol;

  /** UUID del módulo. */
  @Column({
    name: 'modulo_id',
    type: 'uuid',
    nullable: false,
  })
  modulo_id!: string;

  /** Relación con el módulo. */
  @ManyToOne(() => Modulo, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'modulo_id',
    referencedColumnName: 'id',
  })
  modulo!: Modulo;

  /** UUID del permiso. */
  @Column({
    name: 'permiso_id',
    type: 'uuid',
    nullable: false,
  })
  permiso_id!: string;

  /** Relación con el permiso. */
  @ManyToOne(() => Permiso, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'permiso_id',
    referencedColumnName: 'id',
  })
  permiso!: Permiso;

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
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  /** Fecha de actualización. */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  /** Fecha de eliminación lógica. */
  @Column({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;

  /** UUID del usuario que creó el registro. */
  @Column({
    name: 'user_created',
    type: 'uuid',
    nullable: false,
  })
  userCreatedId!: string;

  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_created',
    referencedColumnName: 'id',
  })
  usuario_creador!: Usuario;

  /** UUID del usuario que actualizó el registro. */
  @Column({
    name: 'user_update',
    type: 'uuid',
    nullable: true,
  })
  userUpdateId!: string | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_update',
    referencedColumnName: 'id',
  })
  usuario_actualizador!: Usuario | null;

  /** UUID del usuario que eliminó el registro. */
  @Column({
    name: 'user_deleted',
    type: 'uuid',
    nullable: true,
  })
  userDeletedId!: string | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_deleted',
    referencedColumnName: 'id',
  })
  usuario_eliminador!: Usuario | null;
}
