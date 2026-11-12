import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

/**
 * Módulo: Seguridad / Rol
 * Archivo: rol.entity.ts
 *
 * Descripción:
 * Representa la tabla seguridad.rol.
 * Agrupa permisos mediante códigos funcionales.
 */
@Entity({ schema: 'seguridad', name: 'rol' })
@Unique('UQ_rol_codigo', ['codigo'])
export class Rol {
  /** Identificador UUID del rol. */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /** Código funcional único del rol. */
  @Column({
    name: 'codigo',
    type: 'varchar',
    length: 40,
    nullable: false,
  })
  codigo!: string;

  /** Descripción funcional del rol. */
  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  descripcion!: string;

  /** Estado del registro: ACTIVO o INACTIVO. */
  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    default: 'ACTIVO',
    nullable: false,
  })
  estado!: string;
  /**
   * Fecha de creación del registro.
   * Se genera automáticamente mediante el valor por defecto de la base de datos.
   */
  @Column({
    name: '_created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  /**
   * Fecha de la última actualización del registro.
   * Se administra desde la lógica del servicio.
   */
  @Column({
    name: '_updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt!: Date | null;

  /**
   * Fecha en la que el registro fue dado de baja.
   * Se administra desde la lógica del servicio.
   */
  @Column({
    name: '_deleted_at',
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
