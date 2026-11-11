import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArancelDetalle } from '../../arancel-detalle/entities/arancel-detalle.entity';
import { Tarifa } from '../../tarifa/entities/tarifa.entity';

@Entity({ schema: 'arancel', name: 'arancel_rango' })
export class ArancelRango {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'arancel_det_id' })
  arancel_det_id!: string;

  @ManyToOne(() => ArancelDetalle, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'arancel_det_id', referencedColumnName: 'id' })
  arancel_detalle!: ArancelDetalle;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  desde!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  hasta!: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  base_fija!: number;

  @Column({ type: 'numeric', precision: 6, scale: 4 })
  porcentaje!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  excedente!: number;

  @Column({ type: 'uuid', name: 'tarifa_id' })
  tarifa_id!: string;

  @ManyToOne(() => Tarifa, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tarifa_id', referencedColumnName: 'id' })
  tarifa!: Tarifa;

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
