import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { isIP, isUUID } from 'class-validator';
import { IsNull, Repository } from 'typeorm';

import { Usuario } from '../usuario/entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';

import { SesionCreateResponse } from './interfaces/sesion-response.interface';

import { esErrorDuplicado } from '../../shared/util/errores-duplicados.util';

/**
 * Módulo: Seguridad / Sesión
 * Archivo: sesion.service.ts
 *
 * Descripción:
 *   Gestiona el registro de sesiones de los usuarios.
 *
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@Injectable()
export class SesionService {
  private readonly logger = new Logger(SesionService.name);

  constructor(
    @InjectRepository(Sesion)
    private readonly sesionRepository: Repository<Sesion>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /*
  Nombre del método: crearSesion
  Método HTTP relacionado: POST del login
  Endpoint: El definido por el módulo de autenticación.

  Descripción:
    Registra una sesión después de validar las credenciales.
    Verifica que el usuario exista y esté activo.

  Parámetros:
    - idUsuario: UUID del usuario autenticado.
    - ipAdress: Dirección IP obtenida de la petición.
    - userAgent: Navegador o cliente que realiza la petición.

  Respuestas posibles:
    - Creación correcta: Mensaje e ID de la sesión.
    - 400: Datos inválidos o usuario inactivo.
    - 404: Usuario no encontrado.
    - 409: Conflicto de datos al registrar.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Es un método interno invocado por el login.
    No recibe el usuario ni la auditoría desde el body.
    Permite varias sesiones para el mismo usuario.
    Registra al usuario autenticado como responsable.
  */
  async crearSesion(
    idUsuario: string,
    ipAdress: string | null = null,
    userAgent: string | null = null,
  ): Promise<SesionCreateResponse> {
    try {
      // Validar el identificador del usuario.
      if (typeof idUsuario !== 'string' || !isUUID(idUsuario)) {
        throw new BadRequestException(
          'El identificador del usuario debe ser un UUID válido.',
        );
      }

      // Validar la IP si está disponible.
      if (
        ipAdress !== null &&
        (typeof ipAdress !== 'string' ||
          ipAdress.length > 45 ||
          !isIP(ipAdress))
      ) {
        throw new BadRequestException('La dirección IP no es válida.');
      }

      // Validar la información del cliente.
      if (userAgent !== null && typeof userAgent !== 'string') {
        throw new BadRequestException(
          'La información del navegador debe ser un texto.',
        );
      }

      // Buscar al usuario no eliminado.
      const usuario = await this.usuarioRepository.findOne({
        where: {
          idUsuario,
          deletedAt: IsNull(),
        },
      });

      if (!usuario) {
        throw new NotFoundException('No se encontró el usuario solicitado.');
      }

      if (usuario.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'El usuario debe estar ACTIVO para iniciar una sesión.',
        );
      }

      // Preparar la sesión y su auditoría.
      const sesion = this.sesionRepository.create({
        idUsuario: usuario.idUsuario,
        inicio: new Date(),
        fin: null,

        ipAdress,

        // Ajustar el encabezado a la longitud de la columna.
        userAgent: userAgent?.trim().slice(0, 500) || null,

        estado: 'ACTIVO',
        deletedAt: null,

        userCreated: usuario.idUsuario,
        userUpdate: null,
        userDeleted: null,
      });

      // El UUID se genera mediante PrimaryGeneratedColumn.
      const guardada = await this.sesionRepository.save(sesion);

      return {
        message: 'Sesión creada correctamente.',
        id: guardada.id,
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'No se pudo registrar la sesión por un conflicto de datos.',
        );
      }

      // Conservar los errores de validación y de negocio.
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        'Error al crear la sesión del usuario.',
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );

      throw new InternalServerErrorException(
        'Ocurrió un error al crear la sesión.',
      );
    }
  }
}
