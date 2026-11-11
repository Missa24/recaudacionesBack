import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ schema: 'seguridad', name: 'usuario_rol' })
export class UsuarioRol {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'id_usuario', type: 'uuid' })
  idUsuario!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'idUsuario' })
  usuario!: Usuario;

  @Column({ name: 'id_rol', type: 'uuid' })
  idRol!: string;

  @ManyToOne(() => Rol, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_rol', referencedColumnName: 'id' })
  rol!: Rol;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVO' })
  estado!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'user_created', type: 'uuid' })
  userCreated!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_created', referencedColumnName: 'idUsuario' })
  usuarioCreador!: Usuario;

  @Column({ name: 'user_update', type: 'uuid', nullable: true })
  userUpdate!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_update', referencedColumnName: 'idUsuario' })
  usuarioActualizador!: Usuario | null;

  @Column({ name: 'user_deleted', type: 'uuid', nullable: true })
  userDeleted!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_deleted', referencedColumnName: 'idUsuario' })
  usuarioEliminador!: Usuario | null;
}
