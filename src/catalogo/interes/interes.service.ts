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
import { Repository } from 'typeorm';
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
    this.logger.log(
      `Iniciando creación de Interés. Fecha publicación: ${dto.fecha_publicacion}, Valor: ${dto.valor}, Usuario: ${idUsuario}`,
    );

    // Comprueba si ya existe un registro para la fecha proporcionada.
    const existe = await this.interesRepository.findOne({
      where: { fecha_publicacion: dto.fecha_publicacion },
    });

    if (existe) {
      this.logger.warn(
        `Conflicto al crear Interés: ya existe registro para la fecha ${dto.fecha_publicacion}`,
      );
      throw new ConflictException('Ya existe un Interés para esa fecha');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const interes = this.interesRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });

    try {
      const guardado = await this.interesRepository.save(interes);

      this.logger.log(
        `Interés registrado exitosamente. ID: ${guardado.id}, Fecha: ${guardado.fecha_publicacion}, Valor: ${guardado.valor}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'Interés registrado exitosamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear Interés. Fecha: ${dto.fecha_publicacion}`,
        );
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
    this.logger.log(
      `Listando Intereses. Página: ${query.page ?? 1}, Límite: ${query.limit ?? 10}, Search: ${query.search ?? 'N/A'}, StartDate: ${query.startDate ?? 'N/A'}, EndDate: ${query.endDate ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}`,
    );

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      startDate,
      endDate,
      status,
    } = query;

    // Validar el rango de fechas
    if (startDate && endDate && startDate > endDate) {
      this.logger.warn(
        `Rango de fechas inválido al listar Intereses: startDate ${startDate} > endDate ${endDate}`,
      );
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    // Crear la consulta principal.
    const queryBuilder = this.interesRepository
      .createQueryBuilder('interes')
      .leftJoinAndSelect('interes.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect(
        'interes.usuario_actualizador',
        'usuario_actualizador',
      );

    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('interes.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('interes.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando los Interes de todos los estados');
    }

    // Aplicar filtro por fecha inicial.
    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      queryBuilder.andWhere('interes.fecha_publicacion >= :startDate', {
        startDate,
      });
    }

    // Aplicar filtro por fecha final.
    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      queryBuilder.andWhere('interes.fecha_publicacion <= :endDate', {
        endDate,
      });
    }

    // Aplicar búsqueda general sobre los campos de interes.
    if (search?.trim()) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search.trim()}"`);
      queryBuilder.andWhere(
        `(
        CAST(interes.fecha_publicacion AS TEXT) ILIKE :search
        OR CAST(interes.valor AS TEXT) ILIKE :search
      )`,
        {
          search: `%${search.trim()}%`,
        },
      );
    }

    // Definir los campos permitidos para ordenar.
    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'interes._created_at',
      fecha_publicacion: 'interes.fecha_publicacion',
      valor: 'interes.valor',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      this.logger.warn(`Campo de ordenamiento inválido solicitado: ${sortBy}`);
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    // Aplicar ordenamiento.
    queryBuilder.orderBy(campoOrdenamiento, sortOrder);

    // Aplicar paginación y obtener registros junto con el total.
    const skip = (page - 1) * limit;

    try {
      const [registros, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      // Mapear las entidades a la estructura de respuesta.
      const items: InteresResponse[] = registros.map((registro) =>
        mapearRespuesta(registro),
      );

      // Calcular información de paginación.
      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de Intereses obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${items.length}`,
      );

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
  async buscarPorId(id: string) {
    this.logger.log(`Buscando Interés por ID: ${id}`);

    const interes = await this.interesRepository
      .createQueryBuilder('interes')
      .leftJoin('interes.usuario_creador', 'creador')
      .leftJoin('interes.usuario_actualizador', 'actualizador')
      .select([
        'interes.id',
        'interes.fecha_publicacion',
        'interes.valor',
        'interes.estado',
        'creador.username',
        'actualizador.username',
      ])
      .where('interes.id = :id', { id })
      .getOne();

    if (!interes) {
      this.logger.warn(`Interés no encontrado con ID: ${id}`);
      throw new NotFoundException('No existe un interés con ese identificador');
    }

    this.logger.log(
      `Interés encontrado. ID: ${id}, Fecha: ${interes.fecha_publicacion}`,
    );
    return mapearRespuesta(interes);
  }

  /**
   * Busca un registro de Interés por una fecha específica.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorFecha(fecha: string): Promise<InteresResponse> {
    this.logger.log(`Buscando Interés por fecha: ${fecha}`);

    const interes = await this.interesRepository
      .createQueryBuilder('interes')
      .leftJoin('interes.usuario_creador', 'creador')
      .leftJoin('interes.usuario_actualizador', 'actualizador')
      .select([
        'interes.id',
        'interes.fecha_publicacion',
        'interes.valor',
        'interes.estado',
        'creador.username',
        'actualizador.username',
      ])
      .where('interes.fecha_publicacion = :fecha', { fecha })
      .andWhere('interes.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('interes._deleted_at IS NULL')
      .getOne();

    if (!interes) {
      this.logger.warn(`Interés activo no encontrado para la fecha: ${fecha}`);
      throw new NotFoundException('No existe un interés activo para esa fecha');
    }

    this.logger.log(`Interés encontrado para la fecha: ${fecha}`);
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
    this.logger.log(
      `Iniciando actualización de Interés. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const interes = await this.interesRepository.findOne({
      where: { id: id },
    });

    if (!interes) {
      this.logger.warn(`No se encontró Interés para actualizar. ID: ${id}`);
      throw new NotFoundException(
        'No existe un interés con ese identificador.',
      );
    }

    // Impide modificar registros inactivos o eliminados.
    if (interes.estado !== 'ACTIVO' || interes._deleted_at) {
      this.logger.warn(
        `Intento de actualización sobre Interés no actualizable. ID: ${id}, Estado: ${interes.estado}}`,
      );
      throw new ConflictException('No se puede actualizar el Interés.');
    }

    // Verifica que la nueva fecha no esté asignada a otro registro.
    if (
      dto.fecha_publicacion &&
      dto.fecha_publicacion !== interes.fecha_publicacion
    ) {
      this.logger.debug(
        `Cambio de fecha detectado. Anterior: ${interes.fecha_publicacion}, Nueva: ${dto.fecha_publicacion}`,
      );

      const fechaDuplicada = await this.interesRepository.findOne({
        where: { fecha_publicacion: dto.fecha_publicacion },
      });

      if (fechaDuplicada) {
        this.logger.warn(
          `Conflicto al actualizar Interés: ya existe otro registro para la fecha ${dto.fecha_publicacion}. ID actual: ${id}`,
        );
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

      this.logger.log(
        `Interés actualizado correctamente. ID: ${id}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'Interes actualizado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar Interés. ID: ${id}, Fecha: ${dto.fecha_publicacion ?? interes.fecha_publicacion}`,
        );
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
    this.logger.log(
      `Iniciando cambio de estado de Interés. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const interes = await this.interesRepository.findOne({
      where: { id: id },
    });

    if (!interes) {
      this.logger.warn(`No se encontró Interés para cambiar estado. ID: ${id}`);
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

      this.logger.log(
        `Estado de Interés cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${nuevoEstado}, Usuario: ${idUsuario}`,
      );

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
