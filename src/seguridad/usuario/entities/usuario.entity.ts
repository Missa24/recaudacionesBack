import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'seguridad', name: 'usuario' })
export class Usuario {
  @PrimaryColumn({ name: 'id_usuario', type: 'uuid' })
  idUsuario!: string;

  @Column({ name: 'username', type: 'varchar', length: 50, nullable: true })
  username!: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email!: string;

  @Column({ name: 'ci', type: 'varchar', length: 30, nullable: true })
  ci!: string;

  @Column({ name: 'nombres', type: 'varchar', length: 100, nullable: true })
  nombres!: string;

  @Column({
    name: 'apellido_paterno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoPaterno!: string;

  @Column({
    name: 'apellido_materno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoMaterno!: string | null;

  @Column({ name: 'celular', type: 'varchar', length: 20, nullable: true })
  celular!: string | null;

  @Column({ name: 'estado', type: 'varchar', nullable: true })
  estado!: string;

  @Column({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true })
  ultimoAcceso!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: true })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'user_created', type: 'uuid', nullable: true })
  userCreated!: string;

  @Column({ name: 'user_update', type: 'uuid', nullable: true })
  userUpdate!: string | null;

  @Column({ name: 'user_deleted', type: 'uuid', nullable: true })
  userDeleted!: string | null;
}
