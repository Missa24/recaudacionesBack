import { ArancelRequisito } from 'src/arancel/requisito/entities/requisito.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity({ schema: 'tramite_vut', name: 'requisito_entregado' })
@Unique('uq_requisito_entregado_tramite_arancel', [
  'tramite_id',
  'arancel_requisito_id',
])
export class RequisitoEntregado {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tramite_id' })
  tramite_id!: string;

  @Column({ type: 'uuid', name: 'arancel_requisito_id' })
  arancel_requisito_id!: string;

  @ManyToOne(() => Tramite, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tramite_id', referencedColumnName: 'id' })
  tramite!: Tramite;

  @ManyToOne(() => ArancelRequisito, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'arancel_requisito_id',
    referencedColumnName: 'id',
  })
  arancel_requisito!: ArancelRequisito;

  @Column({ type: 'boolean', default: false })
  entregado!: boolean;

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ type: 'uuid', name: 'verificado_por', nullable: true })
  verificado_por!: string | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'verificado_por',
    referencedColumnName: 'id',
  })
  usuarioVerificador!: Usuario | null;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_verificacion!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;
}
