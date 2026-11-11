import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Tramite } from 'src/tramite/tramite/entities/tramite.entity';
import { Dependencia } from 'src/catalogo/dependencia/entities/dependencia.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Módulo: Trámite VUT - Derivación
 * Archivo: derivacion.entity.ts
 * Descripción:
 * Define la estructura y relaciones de la entidad Derivacion,
 * correspondiente a la tabla derivacion del esquema tramite.
 */
@Entity({ schema: 'tramite', name: 'derivacion' })
export class Derivacion {
  // Identificador único
  @PrimaryGeneratedColumn('uuid', { name: 'id_derivacion' })
  id_derivacion!: string;

  // Claves foráneas
  @Column({ type: 'uuid', name: 'id_tramite' })
  id_tramite!: string;

  @Column({ type: 'uuid', name: 'id_dependencia_destino' })
  id_dependencia_destino!: string;

  @Column({ type: 'uuid', name: '_user_created' })
  usuarios_created_id!: string;

  @Column({ type: 'uuid', name: '_user_update', nullable: true })
  usuarios_update_id!: string | null;

  @Column({ type: 'uuid', name: '_user_delete', nullable: true })
  usuarios_delete_id!: string | null;

  // Relación con trámite
  @ManyToOne(() => Tramite)
  @JoinColumn({ name: 'id_tramite', referencedColumnName: 'id_tramite' })
  tramite!: Tramite;

  // Relación con dependencia destino
  @ManyToOne(() => Dependencia)
  @JoinColumn({
    name: 'id_dependencia_destino',
    referencedColumnName: 'id_dependencia',
  })
  dependenciaDestino!: Dependencia;

  // Relaciones con usuarios de auditoría
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: '_user_created', referencedColumnName: 'idUsuario' })
  usuarioCreador!: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: '_user_update', referencedColumnName: 'idUsuario' })
  usuarioActualizador!: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: '_user_delete', referencedColumnName: 'idUsuario' })
  usuarioEliminador!: Usuario | null;

  // Datos de la derivación
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_derivacion!: Date;

  @Column({ type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado_derivacion!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  recibido_por!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_recepcion!: Date | null;

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  // Estado del registro
  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  // Auditoría
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  _created_at!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  _updated_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  _deleted_at!: Date | null;
}
