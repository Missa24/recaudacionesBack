import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../seguridad/usuario/entities/usuario.entity';

@Entity('bitacora_general')
export class Bitacora {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ name: 'sistema_id', nullable: true })
    sistemaId!: string;

  @Column({ name: 'tabla_afectada', type: 'varchar', length: 100 })
    tablaAfectada!: string;

  @Column({ name: 'registro_id', type: 'uuid' })
    registroId!: string;

  @Column({ type: 'varchar', length: 50 })
    accion!: string;

  @Column({
    name: 'datos_anteriores',
    type: 'jsonb',
    nullable: true,
  })
  datosAnteriores: any;

  @Column({
    name: 'datos_nuevos',
    type: 'jsonb',
    nullable: true,
  })
  datosNuevos: any;

  @Column({ name: 'ip_origen', type: 'varchar', length: 50, nullable: true })
    ipOrigen!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent!: string;

  @CreateDateColumn({ name: 'fecha', type: 'timestamptz' })
    fecha!: Date;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
    usuarioId!: string;  

  @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id', })
    usuario!: Usuario;
}