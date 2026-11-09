import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'seguridad', name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id_usuario!: string;

  @Column({ nullable: true })
  username!: string;
}
