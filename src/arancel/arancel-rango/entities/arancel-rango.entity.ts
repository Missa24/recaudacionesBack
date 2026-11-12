import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tarifa } from '../../tarifa/entities/tarifa.entity';

@Entity({ schema: 'arancel', name: 'arancel_rango' })
export class ArancelRango {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tarifa_id' })
  tarifa_id!: string;

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
