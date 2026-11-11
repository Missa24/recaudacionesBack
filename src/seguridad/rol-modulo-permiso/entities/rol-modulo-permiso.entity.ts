import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Modulo } from '../../modulo/entities/modulo.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';
import { Rol } from '../../rol/entities/rol.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ schema: 'seguridad', name: 'rol_modulo_permiso' })
export class RolModuloPermiso {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'rol_id', type: 'uuid' })
  rol_id!: string;

  @ManyToOne(() => Rol, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rol_id', referencedColumnName: 'id' })
  rol!: Rol;

  @Column({ name: 'modulo_id', type: 'uuid' })
  modulo_id!: string;

  @Column({ name: 'permiso_id', type: 'uuid' })
  permiso_id!: string;

  @ManyToOne(() => Modulo, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'modulo_id', referencedColumnName: 'id' })
  modulo!: Modulo;

  @ManyToOne(() => Permiso, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'permiso_id', referencedColumnName: 'id' })
  permiso!: Permiso;

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
