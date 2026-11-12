import { Dependencia } from 'src/catalogo/dependencia/entities/dependencia.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ schema: 'arancel', name: 'tipo_tramite_catalogo' })
@Unique('tipo_tramite_catalogo_codigo_key', ['codigo'])
export class TipoTramiteCatalogo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  codigo!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 30 })
  tipo_vut!: string;

  @Column({ type: 'uuid', name: 'dependencia_ejecutora_id', nullable: true })
  dependencia_ejecutora_id!: string | null;

  @ManyToOne(() => Dependencia, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'dependencia_ejecutora_id',
    referencedColumnName: 'id',
  })
  dependencia_ejecutora!: Dependencia | null;

  @Column({ type: 'boolean', default: false })
  requiere_hoja_ruta!: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_derivacion!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVO' })
  estado!: string;

  @Column({
    name: '_created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ name: '_updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;

  @Column({ name: '_deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: '_user_created', type: 'uuid' })
  _user_created!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: '_user_created', referencedColumnName: 'id' })
  usuario_creador!: Usuario;

  @Column({ name: '_user_update', type: 'uuid', nullable: true })
  _user_update!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: '_user_update', referencedColumnName: 'id' })
  usuario_actualizador!: Usuario | null;

  @Column({ name: '_user_delete', type: 'uuid', nullable: true })
  _user_delete!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: '_user_delete', referencedColumnName: 'id' })
  usuario_eliminador!: Usuario | null;
}
