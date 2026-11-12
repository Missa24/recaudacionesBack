import { CuentaBancaria } from 'src/catalogo/cuenta-bancaria/entities/cuenta-bancaria.entity';
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

@Entity({ schema: 'arancel', name: 'arancel_general' })
@Unique('arancel_general_nro_arancel_gral_key', ['nro_arancel_gral'])
export class ArancelGeneral {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'dependencia_id' })
  dependencia_id!: string;

  @Column({ type: 'uuid', name: 'cuenta_destino_id', nullable: true })
  cuenta_destino_id!: string | null;

  @Column({ type: 'varchar', length: 15, name: 'nro_arancel_gral' })
  nro_arancel_gral!: string;

  @Column({ type: 'varchar', length: 200 })
  descripcion!: string;

  @ManyToOne(() => CuentaBancaria, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cuenta_destino_id', referencedColumnName: 'id' })
  cuenta_destino!: CuentaBancaria | null;

  @ManyToOne(() => Dependencia, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'dependencia_id',
    referencedColumnName: 'id',
  })
  dependencia!: Dependencia;

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
