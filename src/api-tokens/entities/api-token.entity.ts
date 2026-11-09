import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('api_tokens')
export class ApiToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sistema_id' })
  sistemaId!: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  token!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'jsonb', default: [] })
  permisos!: string[];

  @Column({ name: 'fecha_expiracion', type: 'timestamp', nullable: true })
  fechaExpiracion!: Date | null;

  @Column({ name: 'fecha_ultimo_uso', type: 'timestamp', nullable: true })
  fechaUltimoUso!: Date | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'ip_origen', type: 'varchar', length: 50, nullable: true })
  ipOrigen!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  // ✅ Auditoría
  @CreateDateColumn({ name: '_created_at', type: 'timestamp' })
  _createdAt!: Date;

  @UpdateDateColumn({ name: '_updated_at', type: 'timestamptz' })
  _updatedAt!: Date;

  @DeleteDateColumn({ name: '_deleted_at', type: 'timestamptz', nullable: true })
  _deletedAt!: Date | null;

  @Column({ name: '_user_created', type: 'varchar', length: 100, nullable: true })
  _userCreated!: string | null;

  @Column({ name: '_user_update', type: 'varchar', length: 100, nullable: true })
  _userUpdate!: string | null;

  @Column({ name: '_user_delete', type: 'varchar', length: 100, nullable: true })
  _userDelete!: string | null;
  
}