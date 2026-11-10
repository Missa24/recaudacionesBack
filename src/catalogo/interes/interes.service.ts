/**
 * Módulo: Catálogo - Interes
 * Archivo: interes.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores de Interés.
 * Gestiona registros manuales, sincronización externa, consultas,
 * actualizaciones y cambios de estado, incluyendo el control de auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateInteresDto } from './dto/create-interes.dto';
import { UpdateInteresDto } from './dto/update-interes.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Interes } from './entities/interes.entity';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import {
  InteresMessageResponse,
  InteresResponse,
} from './interface/interes-response.interface';
import { mapearRespuesta } from './util/map-response-interes.util';
import { QueryInteresDto } from './dto/query-interes.dto';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/**
 * Servicio: InteresService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los registros Interés,
 * utilizando TypeORM para interactuar con la base de datos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class InteresService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(InteresService.name);

  constructor(
    @InjectRepository(Interes)
    private readonly interesRepository: Repository<Interes>,
  ) {}

  /**
   * Registra manualmente un nuevo valor de Interés.
   * Verifica que no exista otro registro para la misma fecha
   * y asocia al usuario responsable de la creación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crear(
    dto: CreateInteresDto,
    idUsuario: string,
  ): Promise<InteresMessageResponse> {
    // Comprueba si ya existe un registro para la fecha proporcionada.
    const existe = await this.interesRepository.findOne({
      where: { fecha_publicacion: dto.fecha_publicacion },
    });

    if (existe) {
      throw new ConflictException('Ya existe un Interés para esa fecha');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const interes = this.interesRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });

    try {
      await this.interesRepository.save(interes);

      return {
        message: 'Interés registrado exitosamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('Ya existe un interés para esa fecha');
      }

      this.logger.error(
        `Error al crear un nuevo interés. Fecha: ${dto.fecha_publicacion}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo guardar el registro del interés',
      );
    }
  }

  /**
   * Obtiene los registros UFV aplicando filtros, búsqueda,
   * ordenamiento y paginación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async listar(
    query: QueryInteresDto,
  ): Promise<PaginatedResponse<InteresResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = query;

    // Validar rango de fechas
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    // Definir campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof Interes> = {
      createdAt: '_created_at',
      fecha_publicacion: 'fecha_publicacion',
      valor: 'valor',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    // Construir filtros
    const where: FindOptionsWhere<Interes> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      where.estado = status;
    } else if (!status) {
      where.estado = 'ACTIVO';
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      where.fecha_publicacion = Between(startDate, endDate);
    } else if (startDate) {
      where.fecha_publicacion = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.fecha_publicacion = LessThanOrEqual(endDate);
    }

    try {
      const [registros, total] = await this.interesRepository.findAndCount({
        where,
        relations: {
          usuario_creador: true,
          usuario_actualizador: true,
        },
        order: {
          [campoOrdenamiento]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const items: InteresResponse[] = registros.map((registro) =>
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
    } catch (error) {
      this.logger.error(
        `Error al listar Intereses. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Busca un registro de Interés mediante su identificador único.
   * Incluye los nombres de usuario asociados a su creación y actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<InteresResponse> {
    const interes = await this.interesRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!interes) {
      throw new NotFoundException('No existe un interés con ese identificador');
    }

    return mapearRespuesta(interes);
  }

  /**
   * Busca un registro de Interés por una fecha específica.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorFecha(fecha: string): Promise<InteresResponse> {
    const interes = await this.interesRepository.findOne({
      where: {
        fecha_publicacion: fecha,
        estado: 'ACTIVO',
        _deleted_at: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!interes) {
      throw new NotFoundException('No existe un interés activo para esa fecha');
    }

    return mapearRespuesta(interes);
  }
  /**
   * Actualiza parcialmente un registro de Interés existente.
   * Verifica su existencia, estado y posibles duplicados de fecha.
   * También actualiza los campos de auditoría correspondientes.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdateInteresDto,
    idUsuario: string,
  ): Promise<InteresMessageResponse> {
    const interes = await this.interesRepository.findOne({
      where: { id: id },
    });

    if (!interes) {
      throw new NotFoundException(
        'No existe un interés con ese identificador.',
      );
    }

    // Impide modificar registros inactivos o eliminados.
    if (interes.estado !== 'ACTIVO' || interes._deleted_at) {
      throw new ConflictException('No se puede actualizar el Interés.');
    }

    // Verifica que la nueva fecha no esté asignada a otro registro.
    if (
      dto.fecha_publicacion &&
      dto.fecha_publicacion !== interes.fecha_publicacion
    ) {
      const fechaDuplicada = await this.interesRepository.findOne({
        where: { fecha_publicacion: dto.fecha_publicacion },
      });

      if (fechaDuplicada) {
        throw new ConflictException(
          'Ya existe otro Interés registrado para esa fecha',
        );
      }
    }

    // Aplica únicamente los campos recibidos en la solicitud.
    Object.assign(interes, dto);

    // Actualiza la información de auditoría.
    interes._user_update = idUsuario;
    interes._updated_at = new Date();

    try {
      await this.interesRepository.save(interes);
      return {
        message: 'Interes actualizado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otro Interés registrado para esa fecha',
        );
      }

      this.logger.error(
        `Error al actualizar el interés. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el registro',
      );
    }
  }

  /**
   * Cambia el estado de un registro de Interés entre ACTIVO e INACTIVO.
   * Al desactivar, registra los datos de eliminación lógica.
   * Al reactivar, limpia dichos datos y registra la actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<InteresMessageResponse> {
    const interes = await this.interesRepository.findOne({
      where: { id: id },
    });

    if (!interes) {
      throw new NotFoundException(
        'No existe un Interés con esa identificación',
      );
    }

    const estadoAnterior = interes.estado;
    // Determina el estado contrario al estado actual.
    const nuevoEstado = interes.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    interes.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      // Registra quién y cuándo realizó la desactivación.
      interes._user_delete = idUsuario;
      interes._deleted_at = new Date();
      interes._user_update = null;
      interes._updated_at = null;
    } else {
      // Al reactivar, limpia los datos de eliminación lógica.
      interes._user_update = idUsuario;
      interes._updated_at = new Date();
      interes._user_delete = null;
      interes._deleted_at = null;
    }

    try {
      await this.interesRepository.save(interes);

      return {
        message: `Registro del interes ${interes.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado de Interés. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }
}
