/**
 * Módulo: Seguridad - Sesión
 * Archivo: sesion.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de las sesiones
 * de acceso de los usuarios. Gestiona registros, consultas,
 * paginación, cierre de sesiones y control de auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 12/11/2026
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { Sesion } from './entities/sesion.entity';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { QuerySesionDto } from './dto/query-sesion.dto';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import {
  SesionMessageResponse,
  SesionResponse,
} from './interface/sesion-response.interface';
import { mapearRespuesta } from './util/map-response-sesion.util';

/**
 * Servicio: SesionService
 * Descripción:
 * Implementa las operaciones de negocio para administrar
 * las sesiones de acceso de los usuarios mediante TypeORM.
 */
@Injectable()
export class SesionService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   */
  private readonly logger = new Logger(SesionService.name);

  constructor(
    @InjectRepository(Sesion)
    private readonly sesionRepository: Repository<Sesion>,
  ) {}

  /*
  Nombre del método: crear
  Descripción: Registra una nueva sesión para el usuario autenticado,
               almacenando su dirección IP, user agent y datos de auditoría.
  Parámetros:
    - dto: CreateSesionDto (ipAddress, userAgent)
    - idUsuario: string (usuario que inicia sesión)
  Respuestas posibles:
    - 201: Sesión registrada correctamente.
    - 500: No se pudo registrar la sesión.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  async crear(
    dto: CreateSesionDto,
    idUsuario: string,
  ): Promise<SesionMessageResponse> {
    // Prepara la sesión asociando al usuario propietario y creador.
    const sesion = this.sesionRepository.create({
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      usuario_id: idUsuario,
      usuario: { id: idUsuario },
      usuario_creador: { id: idUsuario },
      estado: 'ACTIVO',
      inicio: new Date(),
    });

    try {
      await this.sesionRepository.save(sesion);

      this.logger.log(`Sesión registrada correctamente. Usuario: ${idUsuario}`);

      return {
        message: 'Sesión registrada correctamente',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al registrar sesión. Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo registrar la sesión');
    }
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene las sesiones aplicando filtros por fecha,
               estado, ordenamiento y paginación.
  Parámetros:
    - query: QuerySesionDto (page, limit, sortBy, sortOrder,
             startDate, endDate, status)
  Respuestas posibles:
    - 200: Listado paginado de sesiones.
    - 400: Rango de fechas inválido o campo de ordenamiento incorrecto.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  async listar(
    query: QuerySesionDto,
  ): Promise<PaginatedResponse<SesionResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = query;

    // Valida el rango de fechas.
    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    // Valida el campo de ordenamiento.
    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'createdAt',
      inicio: 'inicio',
      fin: 'fin',
      estado: 'estado',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    // Construye los filtros.
    const where: FindOptionsWhere<Sesion> = {
      deletedAt: IsNull(),
    };

    // Filtro por estado.
    if (status && status !== 'TODOS') {
      where.estado = status;
    }

    // Filtros por fecha de inicio de sesión.
    if (startDate && endDate) {
      where.inicio = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.inicio = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.inicio = LessThanOrEqual(new Date(endDate));
    }

    // Calcula el desplazamiento para la paginación.
    const skip = (page - 1) * limit;

    try {
      const [registros, total] = await this.sesionRepository.findAndCount({
        where,
        relations: {
          usuario: true,
          usuario_creador: true,
          usuario_actualizador: true,
        },
        order: {
          [campoOrdenamiento]: sortOrder,
        },
        skip,
        take: limit,
      });

      // Transforma las entidades en estructuras de respuesta.
      const items: SesionResponse[] = registros.map((registro) =>
        mapearRespuesta(registro),
      );

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al listar sesiones. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudieron obtener las sesiones',
      );
    }
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca una sesión mediante su identificador UUID,
               incluyendo el usuario propietario y responsables de auditoría.
  Parámetros:
    - id: string (identificador de la sesión)
  Respuestas posibles:
    - 200: Sesión encontrada.
    - 404: No existe una sesión con ese identificador.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  async buscarPorId(id: string): Promise<SesionResponse> {
    const sesion = await this.sesionRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: {
        usuario: true,
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!sesion) {
      throw new NotFoundException('No existe una sesión con ese identificador');
    }

    this.logger.log(`Sesión encontrada. ID: ${id}`);

    return mapearRespuesta(sesion);
  }

  /*
  Nombre del método: listarPorUsuario
  Descripción: Obtiene las sesiones registradas de un usuario específico,
               aplicando paginación y ordenamiento.
  Parámetros:
    - usuarioId: string (identificador del usuario)
    - query: QuerySesionDto (parámetros de consulta)
  Respuestas posibles:
    - 200: Sesiones del usuario obtenidas correctamente.
    - 400: Parámetros de consulta inválidos.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  async listarPorUsuario(
    usuarioId: string,
    query: QuerySesionDto,
  ): Promise<PaginatedResponse<SesionResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = query;

    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'createdAt',
      inicio: 'inicio',
      fin: 'fin',
      estado: 'estado',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    try {
      const qb = this.sesionRepository
        .createQueryBuilder('sesion')
        .leftJoinAndSelect('sesion.usuario', 'usuario')
        .leftJoinAndSelect('sesion.usuario_creador', 'usuario_creador')
        .leftJoinAndSelect(
          'sesion.usuario_actualizador',
          'usuario_actualizador',
        )
        .where('sesion.usuario_id = :usuarioId', { usuarioId })
        .andWhere('sesion._deleted_at IS NULL');

      if (status && status !== 'TODOS') {
        qb.andWhere('sesion.estado = :status', { status });
      }

      if (startDate) {
        qb.andWhere('sesion.inicio >= :startDate', {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        qb.andWhere('sesion.inicio <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      const [registros, total] = await Promise.all([
        qb
          .clone()
          .orderBy(`sesion.${campoOrdenamiento}`, sortOrder)
          .skip((page - 1) * limit)
          .take(limit)
          .getMany(),
        qb.clone().getCount(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items: registros.map(mapearRespuesta),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al listar sesiones del usuario: ${usuarioId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudieron obtener las sesiones del usuario',
      );
    }
  }

  /*
  Nombre del método: cerrar
  Descripción: Finaliza una sesión activa registrando la fecha de cierre
               y los datos de auditoría del usuario que realiza la operación.
  Parámetros:
    - id: string (identificador de la sesión)
    - idUsuario: string (usuario que cierra la sesión)
  Respuestas posibles:
    - 200: Sesión cerrada correctamente.
    - 404: Sesión no encontrada.
    - 409: La sesión ya se encuentra cerrada.
    - 500: No se pudo cerrar la sesión.
  Fecha de creación: 2026-11-12
  Autor: Missael Apaza
  */
  async cerrar(id: string, idUsuario: string): Promise<SesionMessageResponse> {
    const sesion = await this.sesionRepository.findOne({
      where: {
        id,
        usuario_id: idUsuario,
        deletedAt: IsNull(),
      },
    });

    if (!sesion) {
      throw new NotFoundException(
        'No existe una sesión activa para el usuario indicado',
      );
    }

    if (sesion.estado !== 'ACTIVO' || sesion.fin) {
      throw new ConflictException('La sesión ya se encuentra cerrada');
    }

    sesion.fin = new Date();
    sesion.estado = 'CERRADO';
    sesion._user_update = idUsuario;
    sesion.updatedAt = new Date();

    try {
      await this.sesionRepository.save(sesion);

      this.logger.log(`Sesión cerrada correctamente. ID: ${id}`);

      return {
        message: 'Sesión cerrada correctamente',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cerrar sesión. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo cerrar la sesión');
    }
  }
}
