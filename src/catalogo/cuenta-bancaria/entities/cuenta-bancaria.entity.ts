/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: cuenta-bancaria.entity.ts
 * Descripción:
 * Define la estructura y las relaciones de la entidad CuentaBancaria,
 * correspondiente a la tabla cuenta_bancaria del esquema catalogo.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { Banco } from 'src/catalogo/banco/entities/banco.entity';
import { Dependencia } from 'src/catalogo/dependencia/entities/dependencia.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

/**
 * Entidad CuentaBancaria.
 * Representa la información bancaria, su dependencia asociada
 * y los datos de auditoría de las cuentas registradas.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Entity({ schema: 'catalogo', name: 'cuenta_bancaria' })
@Unique('uq_cuenta_bancaria_banco_nro_cuenta', ['banco_id', 'nro_cuenta'])
export class CuentaBancaria {
  /*
   * Identificador único de la cuenta bancaria.
   */
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /*
   * Identificador del banco al que pertenece la cuenta.
   */
  @Column({ type: 'uuid', name: 'banco_id' })
  banco_id!: string;

  /*
   * Relación con el banco propietario de la cuenta.
   */
  @ManyToOne(() => Banco, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'banco_id',
    referencedColumnName: 'id',
  })
  banco!: Banco;

  /*
   * Identificador de la dependencia asociada a la cuenta.
   */
  @Column({
    type: 'uuid',
    name: 'dependencia_id',
    nullable: true,
  })
  dependencia_id!: string | null;

  /*
   * Relación con la dependencia asociada a la cuenta.
   */
  @ManyToOne(() => Dependencia, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'dependencia_id',
    referencedColumnName: 'id',
  })
  dependencia!: Dependencia | null;

  /*
   * Número de cuenta bancaria.
   */
  @Column({ type: 'varchar', length: 50 })
  nro_cuenta!: string;

  /*
   * Nombre o denominación de la cuenta bancaria.
   */
  @Column({ type: 'varchar', length: 150 })
  nombre_cuenta!: string;

  /*
   * Tipo de cuenta bancaria.
   */
  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  /*
   * Estado actual del registro: ACTIVO o INACTIVO.
   */
  @Column({
    type: 'varchar',
    default: 'ACTIVO',
  })
  estado!: string;

  /*
   * Fecha y hora de creación del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  /*
   * Fecha y hora de la última actualización del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  /*
   * Fecha y hora de eliminación lógica del registro.
   */
  @Column({
    type: 'timestamptz',
    name: '_deleted_at',
    nullable: true,
  })
  deletedAt!: Date | null;

  /*
   * Identificador del usuario que creó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_created',
  })
  _user_created!: string;

  /*
   * Relación con el usuario responsable de la creación.
   */
  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_created',
    referencedColumnName: 'id',
  })
  usuario_creador!: Usuario;

  /*
   * Identificador del usuario que actualizó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_update',
    nullable: true,
  })
  _user_update!: string | null;

  /*
   * Relación con el usuario responsable de la actualización.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_update',
    referencedColumnName: 'id',
  })
  usuario_actualizador!: Usuario | null;

  /*
   * Identificador del usuario que inactivó el registro.
   */
  @Column({
    type: 'uuid',
    name: '_user_delete',
    nullable: true,
  })
  _user_delete!: string | null;

  /*
   * Relación con el usuario responsable de la inactivación.
   */
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: '_user_delete',
    referencedColumnName: 'id',
  })
  usuario_eliminador!: Usuario | null;
}
