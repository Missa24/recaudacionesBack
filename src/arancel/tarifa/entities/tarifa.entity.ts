import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ArancelDetalle } from '../../arancel-detalle/entities/arancel-detalle.entity';

@Entity({ schema: 'arancel', name: 'tarifa' })
@Unique('tarifa_id_tarifa_id_arancel_det_key', ['id', 'arancel_det_id'])
export class Tarifa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'id_arancel_det' })
  arancel_det_id!: string;

  @ManyToOne(() => ArancelDetalle, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_arancel_det', referencedColumnName: 'id' })
  arancel_det!: ArancelDetalle;

  @Column({ type: 'date' })
  vigente_desde!: string;

  @Column({ type: 'date', nullable: true })
  vigente_hasta!: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  monto!: number;

  @Column({ type: 'text' })
  referencia_aprobacion!: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVO' })
  estado!: string;

  @Column({
    name: '_created_at',
    type: 'timestamptz',
    default: () => 'clock_timestamp()',
  })
  _created_at!: Date;

  @Column({
    name: '_updated_at',
    type: 'timestamptz',
    default: () => 'clock_timestamp()',
    nullable: true,
  })
  _updated_at!: Date;

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
