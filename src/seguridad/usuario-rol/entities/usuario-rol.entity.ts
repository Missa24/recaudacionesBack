import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Usuario } from "../../usuario/entities/usuario.entity";
import { Rol } from "../../rol/entities/rol.entity";

/**
 * Módulo: Seguridad / UsuarioRol
 * Archivo: usuario-rol.entity.ts
 * Descripción:
 *   Mapea la tabla de asignaciones con estado y auditoría.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@Entity({ schema: "seguridad", name: "usuario_rol" })
export class UsuarioRol {
  /** UUID de la asignación, generado en el servicio con randomUUID. */
  @PrimaryColumn({ name: "id", type: "uuid" })
  id!: string;

  /** UUID de usuario relacionado. */
  @Column({ name: "id_usuario", type: "uuid" })
  idUsuario!: string;

  /** Relación obligatoria; no elimina en cascada el registro relacionado. */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "id_usuario", referencedColumnName: "idUsuario" })
  usuario!: Usuario;

  /** UUID de rol relacionado. */
  @Column({ name: "id_rol", type: "uuid" })
  idRol!: string;

  /** Relación obligatoria; no elimina en cascada el registro relacionado. */
  @ManyToOne(() => Rol, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "id_rol", referencedColumnName: "id" })
  rol!: Rol;

  /** Alta o baja de esta asignación. */
  @Column({ type: "text", default: "ACTIVO" })
  estado!: string;

  /** Auditoría: created_at. */
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  /** Auditoría: updated_at. */
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  /** Auditoría: deleted_at. */
  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt!: Date | null;

  /** Auditoría: user_created. */
  @Column({ name: "user_created", type: "uuid" })
  userCreated!: string;

  /** Auditoría: user_update. */
  @Column({ name: "user_update", type: "uuid", nullable: true })
  userUpdate!: string | null;

  /** Auditoría: user_deleted. */
  @Column({ name: "user_deleted", type: "uuid", nullable: true })
  userDeleted!: string | null;
}
