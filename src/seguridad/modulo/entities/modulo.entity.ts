import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Módulo: Seguridad / Módulo
 * Archivo: modulo.entity.ts
 *
 * Descripción:
 * Representa la tabla seguridad.modulo.
 * Administra los módulos funcionales y sus rutas
 * de navegación dentro del sistema.
 */
@Entity({ schema: 'seguridad', name: 'modulo' })
@Unique('UQ_modulo_codigo', ['codigo'])
export class Modulo {
  /** Identificador UUID del módulo. */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /** Nombre visible del módulo. */
  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre!: string;

  /** Código funcional único del módulo. */
  @Column({
    name: 'codigo',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  codigo!: string;

  /** Descripción funcional del módulo. */
  @Column({
    name: 'descripcion',
    type: 'text',
    nullable: true,
  })
  descripcion!: string | null;

  /** Ruta interna de navegación del módulo. */
  @Column({
    name: 'ruta',
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  ruta!: string;

  /** Estado del registro: ACTIVO o INACTIVO. */
  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    default: 'ACTIVO',
    nullable: false,
  })
  estado!: string;

  /** Fecha de creación. */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  /** Fecha de última actualización. */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  /** Fecha de eliminación lógica. */
  @Column({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;
  // Identificador del usuario que creó el registro.
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  _user_created!: string;

  /**
   * Relación con el usuario responsable de la creación.
   * No permite eliminar usuarios que tengan registros asociados.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'id',
  })
  usuario_creador!: Usuario;

  // Identificador del usuario que realizó la última actualización.
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  _user_update!: string | null;

  /**
   * Relación con el usuario responsable de la actualización.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'id',
  })
  usuario_actualizador!: Usuario | null;

  // Identificador del usuario que realizó la eliminación lógica.
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /**
   * Relación con el usuario responsable de la eliminación lógica.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'id',
  })
  usuario_eliminador!: Usuario | null;
}
