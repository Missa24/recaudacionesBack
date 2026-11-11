import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Representa la tabla seguridad.modulo. Conserva los nombres de columna proporcionados.
 * Desarrollado por: Oscar Canchari.
 */
@Entity({ schema: 'seguridad', name: 'modulo' })
export class Modulo {
  /** Identificador generado por PostgreSQL/TypeORM. */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Dato de modulo: nombres. */
  @Column({ type: 'varchar', length: 150 })
  nombres!: string;

  /** Dato de modulo: codigo. */
  @Column({ type: 'varchar', length: 40 })
  codigo!: string;

  /** Descripción opcional. */
  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  /** Dato de modulo: ruta. */
  @Column({ type: 'varchar', length: 200 })
  ruta!: string;

  /** Estado gestionado por el servicio; no se recibe en el DTO. */
  @Column({ type: 'text', default: 'ACTIVO' })
  estado!: string;

  /** Auditoría: created_at. */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  /** Auditoría: updated_at. */
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  /** Auditoría: deleted_at. */
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;

  /** Auditoría: user_created. */
  @Column({ type: 'uuid' })
  user_created!: string;

  /** Auditoría: user_update. */
  @Column({ type: 'uuid', nullable: true })
  user_update!: string | null;

  /** Auditoría: user_deleted. */
  @Column({ type: 'uuid', nullable: true })
  user_deleted!: string | null;
}
