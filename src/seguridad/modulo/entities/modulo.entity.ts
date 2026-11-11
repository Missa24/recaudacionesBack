import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Representa la tabla seguridad.modulo.
 * Desarrollado por: Oscar Canchari.
 */
@Entity({ schema: 'seguridad', name: 'modulo' })
export class Modulo {
  /** Llave primaria del módulo. */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Nombre del módulo. */
  @Column({ type: 'varchar', length: 150 })
  nombres!: string;

  /** Código del módulo. */
  @Column({ type: 'varchar', length: 40 })
  codigo!: string;

  /** Descripción opcional. */
  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion!: string | null;

  /** Ruta del módulo. */
  @Column({ type: 'varchar', length: 200 })
  ruta!: string;

  /** Estado gestionado por el servicio. */
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
