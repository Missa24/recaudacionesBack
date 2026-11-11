import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

/**
 * Representa la tabla seguridad.sesion.
 * Desarrollado por: Oscar Canchari.
 */
@Entity({ schema: 'seguridad', name: 'sesion' })
export class Sesion {
  /** Llave primaria de la sesión. */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** UUID del usuario relacionado. */
  @Column({ name: 'usuario_id', type: 'uuid' })
  idUsuario!: string;

  /** Relación con la llave primaria del usuario. */
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  /** Fecha de inicio de la sesión. */
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  inicio!: Date;

  /** Fecha de finalización; nula mientras la sesión esté abierta. */
  @Column({ type: 'timestamptz', nullable: true })
  fin!: Date | null;

  /** Dirección IP del cliente. */
  /** Dirección IP del cliente. */
  @Column({
    name: 'ip_adress',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAdress!: string | null;
  /** Información del navegador o cliente. */
  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  userAgent!: string | null;

  /** Estado de la sesión. */
  @Column({
    type: 'varchar',
    length: 50,
    default: 'ACTIVO',
  })
  estado!: string;

  /** Fecha de creación. */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  /** Fecha de actualización. */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  /** Fecha de eliminación lógica. */
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;

  /** Usuario que creó el registro. */
  @Column({ name: 'user_created', type: 'uuid' })
  userCreated!: string;

  /** Usuario que actualizó el registro. */
  @Column({ name: 'user_update', type: 'uuid', nullable: true })
  userUpdate!: string | null;

  /** Usuario que eliminó el registro. */
  @Column({ name: 'user_deleted', type: 'uuid', nullable: true })
  userDeleted!: string | null;
}
