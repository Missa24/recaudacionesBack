import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';

/**
 * Módulo: Seguridad / Sesión
 * Archivo: sesion.entity.ts
 *
 * Descripción:
 * Representa la tabla seguridad.sesion.
 * Registra las sesiones de acceso de los usuarios
 * y su contexto técnico.
 */
@Entity({ schema: 'seguridad', name: 'sesion' })
export class Sesion {
  /** Identificador UUID de la sesión. */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** UUID del usuario propietario de la sesión. */
  @Column({
    name: 'usuario_id',
    type: 'uuid',
    nullable: false,
  })
  usuario_id!: string;

  /** Relación con el usuario propietario de la sesión. */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'usuario_id',
    referencedColumnName: 'id',
  })
  usuario!: Usuario;

  /** Fecha y hora de inicio de sesión. */
  @Column({
    name: 'inicio',
    type: 'timestamptz',
    default: () => 'now()',
    nullable: false,
  })
  inicio!: Date;

  /** Fecha y hora de cierre de sesión. */
  @Column({
    name: 'fin',
    type: 'timestamptz',
    nullable: true,
  })
  fin!: Date | null;

  /** Dirección IP del cliente IPv4 o IPv6. */
  @Column({
    name: 'ip_address',
    type: 'inet',
    nullable: true,
  })
  ipAddress!: string | null;

  /** Información del navegador o cliente. */
  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent!: string | null;

  /** Estado de la sesión. */
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

  /** UUID del usuario que creó el registro. */
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

  /** UUID del usuario que actualizó el registro. */
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

  /** UUID del usuario que eliminó el registro. */
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
