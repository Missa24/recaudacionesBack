import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Requisito as RequisitoCatalogo } from 'src/catalogo/requisito/entities/requisito.entity';
import { TipoTramiteCatalogo } from '../../tipo-tramite-catalogo/entities/tipo-tramite-catalogo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ schema: 'arancel', name: 'requisito' })
@Unique('uq_requisito_tipo_documento', [
  'tipo_tramite_id',
  'requisito_catalogo_id',
])
export class ArancelRequisito {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tipo_tramite_id' })
  tipo_tramite_id!: string;

  @ManyToOne(() => TipoTramiteCatalogo, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tipo_tramite_id', referencedColumnName: 'id' })
  tipo_tramite!: TipoTramiteCatalogo;

  @Column({ type: 'uuid', name: 'requisito_catalogo_id' })
  requisito_catalogo_id!: string;

  @ManyToOne(() => RequisitoCatalogo, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'requisito_catalogo_id',
    referencedColumnName: 'id',
  })
  requisito_catalogo!: RequisitoCatalogo;

  @Column({ type: 'boolean', default: false })
  obligatorio!: boolean;

  @Column({ type: 'smallint' })
  orden!: number;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVO' })
  estado!: string;

  @Column({
    name: '_created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  _created_at!: Date;

  @Column({ name: '_updated_at', type: 'timestamptz', nullable: true })
  _updated_at!: Date | null;

  @Column({ name: '_deleted_at', type: 'timestamptz', nullable: true })
  _deleted_at!: Date | null;

  @Column({ name: '_user_created', type: 'uuid' })
  _user_created!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: '_user_created', referencedColumnName: 'idUsuario' })
  usuario_creador!: Usuario;

  @Column({ name: '_user_update', type: 'uuid', nullable: true })
  _user_update!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: '_user_update', referencedColumnName: 'idUsuario' })
  usuario_actualizador!: Usuario | null;

  @Column({ name: '_user_delete', type: 'uuid', nullable: true })
  _user_delete!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: '_user_delete', referencedColumnName: 'idUsuario' })
  usuario_eliminador!: Usuario | null;
}
