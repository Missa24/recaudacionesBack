import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArancelGeneral } from '../../arancel-general/entities/arancel-general.entity';
import { TipoTramiteCatalogo } from '../../tipo-tramite-catalogo/entities/tipo-tramite-catalogo.entity';

@Entity({ schema: 'arancel', name: 'arancel_detalle' })
export class ArancelDetalle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'arancel_general_id' })
  arancel_general_id!: string;

  @ManyToOne(() => ArancelGeneral, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'arancel_general_id', referencedColumnName: 'id' })
  arancel_general!: ArancelGeneral;

  @Column({ type: 'uuid', name: 'tipo_tramite_id' })
  tipo_tramite_id!: string;

  @ManyToOne(() => TipoTramiteCatalogo, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tipo_tramite_id', referencedColumnName: 'id' })
  tipo_tramite!: TipoTramiteCatalogo;

  @Column({ type: 'varchar', length: 20, name: 'nro_arancel_det' })
  nro_arancel_det!: string;

  @Column({ type: 'varchar', length: 250 })
  descripcion!: string;

  @Column({ type: 'boolean', default: false })
  monto_variable!: boolean;

  @Column({ type: 'varchar', length: 80, nullable: true })
  unidad_calculo!: string | null;

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
