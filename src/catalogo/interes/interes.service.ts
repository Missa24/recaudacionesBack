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

  /*
  Nombre del método: crear
  Descripción: Registra manualmente un nuevo valor de Interés. Verifica que no
               exista otro registro para la misma fecha y asocia al usuario creador.
  Parámetros:
    - dto: CreateInteresDto (fecha_publicacion, valor, ...)
    - idUsuario: string (usuario que crea)
  Respuestas posibles:
    - 201: Interés registrado exitosamente.
    - 409: Ya existe un Interés para esa fecha.
    - 500: No se pudo guardar el registro del interés.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      usuario_creador: { id: idUsuario },
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

  /*
  Nombre del método: listar
  Descripción: Obtiene los registros de Interés (UFV) aplicando filtros,
               búsqueda, ordenamiento y paginación.
  Parámetros:
    - query: QueryInteresDto (page, limit, sortBy, sortOrder, startDate,
             endDate, status)
  Respuestas posibles:
    - 200: Listado paginado de intereses.
    - 400: Rango de fechas inválido (startDate > endDate) / campo de
           ordenamiento no válido.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      createdAt: 'createdAt',
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

  /*
  Nombre del método: buscarPorId
  Descripción: Busca un registro de Interés por su identificador único e incluye
               los usuarios de creación y actualización.
  Parámetros:
    - id: string (identificador del interés)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe un interés con ese identificador.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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

  /*
  Nombre del método: buscarPorFecha
  Descripción: Busca un registro de Interés por una fecha específica, solo si
               está ACTIVO y no eliminado lógicamente.
  Parámetros:
    - fecha: string (fecha de publicación a buscar)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe un interés activo para esa fecha.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se usa para la ruta `interes/fecha/:fecha` y debe declararse
                     antes de `:id` para que la ruta literal no sea capturada por
                     el parámetro genérico.
*/
  async buscarPorFecha(fecha: string): Promise<InteresResponse> {
    const interes = await this.interesRepository.findOne({
      where: {
        fecha_publicacion: fecha,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
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

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un registro de Interés existente.
               Verifica existencia, estado ACTIVO (no eliminado) y posibles
               duplicados de fecha, actualizando los campos de auditoría.
  Parámetros:
    - id: string (identificador del interés)
    - dto: UpdateInteresDto (campos a actualizar)
    - idUsuario: string (usuario que actualiza)
  Respuestas posibles:
    - 200: Interés actualizado correctamente.
    - 404: No existe un interés con ese identificador.
    - 409: No se puede actualizar el Interés / ya existe otro Interés para esa fecha.
    - 500: No se pudo actualizar el registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
    if (interes.estado !== 'ACTIVO' || interes.deletedAt) {
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
    interes.updatedAt = new Date();

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

  /*
  Nombre del método: cambiarEstado
  Descripción: Cambia el estado de un registro de Interés entre ACTIVO e
               INACTIVO. Al desactivar registra eliminación lógica; al reactivar
               limpia esos datos y registra la actualización.
  Parámetros:
    - id: string (identificador del interés)
    - idUsuario: string (usuario que realiza el cambio)
  Respuestas posibles:
    - 200: Registro del interés activado/inactivado correctamente.
    - 404: No existe un Interés con esa identificación.
    - 500: No se pudo cambiar el estado del registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      interes.deletedAt = new Date();
      interes._user_update = null;
      interes.updatedAt = null;
    } else {
      // Al reactivar, limpia los datos de eliminación lógica.
      interes._user_update = idUsuario;
      interes.updatedAt = new Date();
      interes._user_delete = null;
      interes.deletedAt = null;
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
