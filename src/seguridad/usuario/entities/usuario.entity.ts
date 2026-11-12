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

/**
 * Módulo: Seguridad / Usuario
 * Archivo: usuario.entity.ts
 *
 * Descripción:
 * Representa la tabla seguridad.usuario de PostgreSQL.
 * Contiene los datos personales, el estado y los campos
 * de auditoría de los usuarios del sistema.
 *
 * Fecha de creación: 2026-11-10
 * Autor: Missael Apaza
 */
@Entity({ schema: 'seguridad', name: 'usuario' })
@Unique('UQ_usuario_username', ['username'])
@Unique('UQ_usuario_email', ['email'])
export class Usuario {
  /** Identificador UUID del usuario. */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Nombre de usuario utilizado para identificarlo. */
  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
  })
  username!: string;

  /** Correo electrónico del usuario. */
  @Column({
    name: 'email',
    type: 'varchar',
  })
  email!: string;

  /** Número de carnet de identidad. */
  @Column({
    name: 'ci',
    type: 'varchar',
    length: 30,
  })
  ci!: string;

  /** Nombres del usuario. */
  @Column({
    name: 'nombres',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombres!: string | null;

  /** Apellido paterno del usuario. */
  @Column({
    name: 'apellido_paterno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoPaterno!: string | null;

  /** Apellido materno, cuando corresponda. */
  @Column({
    name: 'apellido_materno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoMaterno!: string | null;

  /** Número de celular opcional. */
  @Column({
    name: 'celular',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  celular!: string | null;

  /**
   * Estado del usuario.
   * ACTIVO: usuario habilitado.
   * INACTIVO: usuario dado de baja.
   *
   * Los registros nuevos tienen ACTIVO por defecto.
   */
  @Column({
    type: 'text',
    default: 'ACTIVO',
  })
  estado!: string;

  /** Fecha y hora del último acceso al sistema. */
  @Column({
    name: 'ultimo_acceso',
    type: 'timestamptz',
    nullable: true,
  })
  ultimoAcceso!: Date | null;

  /** Fecha y hora de creación del usuario. */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  /** Fecha y hora de la última modificación. */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt!: Date | null;

  /** Fecha de eliminación lógica, si corresponde. */
  @Column({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;

  /**
   * Identificador del usuario que creó el registro.
   * Permite NULL para inicializar el primer usuario
   * administrador del sistema.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
    nullable: true,
  })
  _user_created!: string | null;

  /**
   * Relación con el usuario responsable de la creación.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'id',
  })
  usuario_creador!: Usuario | null;

  /** Identificador del usuario que realizó la actualización. */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  _user_update!: string | null;

  /**
   * Relación con el usuario responsable de la actualización.
   */
  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'id',
  })
  usuario_actualizador!: Usuario | null;

  /** Identificador del usuario que realizó la eliminación lógica. */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /**
   * Relación con el usuario responsable de la eliminación lógica.
   */
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
