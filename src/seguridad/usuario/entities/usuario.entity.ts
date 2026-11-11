import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
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
 * Autor: Oscar Canchari
 */
@Entity({ schema: 'seguridad', name: 'usuario' })
export class Usuario {
  /** Identificador UUID del usuario. */
  @PrimaryColumn({
    name: 'id_usuario',
    type: 'uuid',
  })
  //@PrimaryGeneratedColumn("uuid")
  idUsuario!: string;

  /** Nombre de usuario utilizado para identificarlo. */
  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  username!: string;

  /** Correo electrónico del usuario. */
  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
  })
  email!: string;

  /** Número de carnet de identidad. */
  @Column({
    name: 'ci',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  ci!: string;

  /** Nombres del usuario. */
  @Column({
    name: 'nombres',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombres!: string;

  /** Apellido paterno del usuario. */
  @Column({
    name: 'apellido_paterno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoPaterno!: string;

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
    nullable: true,
  })
  createdAt!: Date | null;

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

  /** UUID del usuario responsable de la creación. */
  @Column({
    name: 'user_created',
    type: 'uuid',
    nullable: true,
  })
  userCreated!: string | null;

  /** UUID del usuario responsable de la actualización. */
  @Column({
    name: 'user_update',
    type: 'uuid',
    nullable: true,
  })
  userUpdate!: string | null;

  /** UUID del usuario responsable de la eliminación. */
  @Column({
    name: 'user_deleted',
    type: 'uuid',
    nullable: true,
  })
  userDeleted!: string | null;
}
