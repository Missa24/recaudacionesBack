import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

/**
 * Módulo: Seguridad / Usuario
 * Archivo: usuario.module.ts
 *
 * Descripción:
 * Registra la entidad, el Controller y el Service
 * necesarios para gestionar usuarios.
 *
 * Fecha de creación: 2026-11-10
 * Autor: Oscar Canchari
 */
@Module({
  imports: [
    // Habilita el repositorio TypeORM de Usuario.
    TypeOrmModule.forFeature([Usuario]),
  ],

  // Controller que recibe las solicitudes HTTP.
  controllers: [UsuarioController],

  // Servicio encargado de la lógica de negocio.
  providers: [UsuarioService],

  // Permite usar UsuarioService desde otros módulos.
  exports: [UsuarioService],
})
export class UsuarioModule {}
