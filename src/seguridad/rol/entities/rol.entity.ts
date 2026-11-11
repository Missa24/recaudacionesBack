import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Representa la tabla seguridad.rol.
 * Desarrollado por: Oscar Canchari.
 */
@Entity({ schema: 'seguridad', name: 'rol' })
export class Rol {
  /** Llave primaria del rol. */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Nombre del rol. */
  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  /** Código del rol. */
  @Column({ type: 'varchar', length: 40 })
  codigo!: string;

  /** Descripción opcional. */
  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion!: string | null;

  /** Estado gestionado por el servicio; no se recibe en el DTO. */
  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVO',
  })
  estado!: string;

  /** Fecha de creación. */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  /** Fecha de actualización. */
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  /** Fecha de eliminación lógica. */
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;

  /** Usuario que creó el registro. */
  @Column({ type: 'uuid' })
  user_created!: string;

  /** Usuario que actualizó el registro. */
  @Column({ type: 'uuid', nullable: true })
  user_update!: string | null;

  /** Usuario que eliminó el registro. */
  @Column({ type: 'uuid', nullable: true })
  user_deleted!: string | null;
}
